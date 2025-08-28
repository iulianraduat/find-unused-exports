// Post controller with comprehensive CRUD operations
import { HTTP_STATUS_CODES } from '@shared/constants'
import { CreatePostRequest, UpdatePostRequest } from '@shared/types'
import { validatePostContent, validatePostTitle } from '@shared/validators'
import { Request, Response } from 'express'
import { PostService } from '../services/PostService'

export class PostController {
  private postService: PostService

  constructor() {
    this.postService = new PostService()
  }

  async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const category = req.query.category as string
      const authorId = req.query.authorId as string
      const sortBy = (req.query.sortBy as string) || 'createdAt'
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc'

      const result = await this.postService.getAllPosts({
        page,
        limit,
        category,
        authorId,
        sortBy,
        sortOrder,
      })

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      })
    } catch (error) {
      console.error('Error fetching posts:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch posts',
      })
    }
  }

  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const includeComments = req.query.includeComments === 'true'
      const includeAuthor = req.query.includeAuthor === 'true'

      const post = await this.postService.getPostById(id, {
        includeComments,
        includeAuthor,
      })

      if (!post) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Post not found',
        })
        return
      }

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: post,
      })
    } catch (error) {
      console.error('Error fetching post:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch post',
      })
    }
  }

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const postData: CreatePostRequest = req.body
      const userId = req.user?.id // Assuming user is attached to request by auth middleware

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        })
        return
      }

      // Validate post data
      const titleValidation = validatePostTitle(postData.title)
      const contentValidation = validatePostContent(postData.content)

      const errors: string[] = [...titleValidation.errors, ...contentValidation.errors]

      if (errors.length > 0) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors,
        })
        return
      }

      const post = await this.postService.createPost({
        ...postData,
        authorId: userId,
      })

      res.status(HTTP_STATUS_CODES.CREATED).json({
        success: true,
        data: post,
        message: 'Post created successfully',
      })
    } catch (error) {
      console.error('Error creating post:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create post',
      })
    }
  }

  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData: UpdatePostRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        })
        return
      }

      // Check if post exists and user has permission to update
      const existingPost = await this.postService.getPostById(id)
      if (!existingPost) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Post not found',
        })
        return
      }

      if (existingPost.authorId !== userId && req.user?.role !== 'admin') {
        res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Permission denied',
        })
        return
      }

      // Validate update data
      const errors: string[] = []
      if (updateData.title) {
        const titleValidation = validatePostTitle(updateData.title)
        errors.push(...titleValidation.errors)
      }
      if (updateData.content) {
        const contentValidation = validatePostContent(updateData.content)
        errors.push(...contentValidation.errors)
      }

      if (errors.length > 0) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors,
        })
        return
      }

      const updatedPost = await this.postService.updatePost(id, updateData)

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: updatedPost,
        message: 'Post updated successfully',
      })
    } catch (error) {
      console.error('Error updating post:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update post',
      })
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user?.id

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        })
        return
      }

      // Check if post exists and user has permission to delete
      const existingPost = await this.postService.getPostById(id)
      if (!existingPost) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Post not found',
        })
        return
      }

      if (existingPost.authorId !== userId && req.user?.role !== 'admin') {
        res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Permission denied',
        })
        return
      }

      await this.postService.deletePost(id)

      res.status(HTTP_STATUS_CODES.NO_CONTENT).json({
        success: true,
        message: 'Post deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete post',
      })
    }
  }

  async getPostsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await this.postService.getPostsByCategory(category, {
        page,
        limit,
      })

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      })
    } catch (error) {
      console.error('Error fetching posts by category:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch posts by category',
      })
    }
  }

  async searchPosts(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const category = req.query.category as string

      if (!query || query.trim().length === 0) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Search query is required',
        })
        return
      }

      const result = await this.postService.searchPosts(query, {
        page,
        limit,
        category,
      })

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
        query,
      })
    } catch (error) {
      console.error('Error searching posts:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to search posts',
      })
    }
  }

  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user?.id

      if (!userId) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        })
        return
      }

      const result = await this.postService.likePost(id, userId)

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: result,
        message: result.liked ? 'Post liked' : 'Post unliked',
      })
    } catch (error) {
      console.error('Error liking post:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to like post',
      })
    }
  }

  async getPostStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const stats = await this.postService.getPostStats(id)

      if (!stats) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Post not found',
        })
        return
      }

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error fetching post stats:', error)
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch post stats',
      })
    }
  }
}

// UNUSED EXPORTS - These should be detected by the extension
export function unusedPostFunction(): string {
  return 'This function is never used'
}

export const UNUSED_POST_CONSTANT = {
  defaultCategory: 'general',
  maxTitleLength: 100,
}

export class UnusedPostClass {
  private data: any[] = []

  addData(item: any): void {
    this.data.push(item)
  }

  getData(): any[] {
    return this.data
  }
}

export interface UnusedPostInterface {
  id: string
  title: string
  content: string
}

export type UnusedPostType = {
  status: 'draft' | 'published' | 'archived'
  metadata: Record<string, any>
}

import { used_component } from '@/used_components';
import { used_component2 } from './src/used_components2';
import { used_function } from '@/functions/used_functions';
import { used_function2 } from '@functions/used_functions2';
import { used_function3 } from './utils/functions/used_functions3';
import { used_type2 } from './types/used_types2';

used_component();
used_component2();

used_function({ txt: 'used' } as used_type2);
used_function2();
used_function3();

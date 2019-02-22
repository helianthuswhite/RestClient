// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {eslint} from 'rollup-plugin-eslint';

export default {
    input: 'src/client.js',
    output: {
        file: 'index.js',
        format: 'amd'
    },
    plugins: [
        resolve(),
        eslint({
            exclude: 'node_modules/**'
        }),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        })
    ]
};
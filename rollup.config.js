// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import {eslint} from 'rollup-plugin-eslint';

export default {
    input: 'index.js',
    output: {
        file: 'restclient.min.js',
        format: 'cjs'
    },
    plugins: [
        resolve(),
        eslint({
            exclude: 'node_modules/**'
        }),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        }),
        (process.env.NODE_ENV === 'production' && uglify())
    ]
};
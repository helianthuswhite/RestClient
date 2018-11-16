// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    input: 'src',
    output: {
        file: 'dist',
        format: 'cjs'
    },
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        }),
        (process.env.NODE_ENV === 'production' && uglify())
    ]
};
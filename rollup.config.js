// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';

export default {
    input: 'src/main.ts',
    output: {
        file: 'dist/index.js',
        name: 'RestClient',
        format: 'umd',
        sourcemap: true
    },
    plugins: [
        typescript(),
        resolve({
            extensions: ['.js', '.jsx', '.ts', '.tsx']
        }),
        babel({
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            exclude: 'node_modules/**' // 只编译我们的源代码
        })
    ]
};

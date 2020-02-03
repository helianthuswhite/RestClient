// rollup.config.js
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import resolve from 'rollup-plugin-node-resolve';
import liveload from 'rollup-plugin-livereload';

export default {
    input: 'demo/index.js',
    output: {
        file: 'demo/bundle.js',
        format: 'iife'
    },
    global: 'RestClient',
    plugins: [
        serve(),
        liveload(),
        resolve({
            extensions: ['.js', '.jsx', '.ts', '.tsx']
        }),
        babel({
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            include: 'demo/index.js'
        })
    ]
};

import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.js',
    output: {
        file: 'demo/dist/component.min.js',
        format: 'cjs',
    },
    plugins: [
        cleanup(),
        getBabelOutputPlugin({
            presets: ['@babel/preset-env']
        }),
        terser()
    ]
}

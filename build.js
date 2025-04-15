import esbuild from 'esbuild';

const dev = process.argv.includes("--dev");
const minify = !dev;

const watch = process.argv.includes("--watch");

const baseConfig = {
    entryPoints : ['src/index.ts'],
    bundle : true,
    minify,
    sourcemap : true,
    outdir : 'dist',
} 

if(!watch){
    Promise.all([
        esbuild.build({
            ...baseConfig,
            format : 'esm'
        }),
        esbuild.build({
            ...baseConfig,
            format : 'cjs',
            outExtension : {
                ".js" : ".cjs"
            }
        })
    ]).catch(()=>{
        console.error(...data, "build failed")
        process.exit(1);
    })
}




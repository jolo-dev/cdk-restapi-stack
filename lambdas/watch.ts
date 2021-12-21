import { build } from 'esbuild';
import glob from 'glob';
import { exec } from 'shelljs';


glob('./src/?(get|post|put|delete)/**.ts', async (er, files) => {
  console.log('Start building and watching the files ', files);

  await build({
    entryPoints: files,
    bundle: true,
    minify: true,
    platform: 'node',
    target: 'node14.7',
    outdir: 'dist',
    watch: {
      onRebuild(error, result) {
        console.log('rebuilding');
        if (error) {
          console.error('watch build failed:', error);
        } else {
          console.log('watch build succeeded and now trying to deploy');
          exec('bash ./cdklocal_deploy.sh');
        }
      },
    },
  });

});
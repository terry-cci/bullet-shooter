import { dest, parallel, series, src, watch } from "gulp";

import bs, { stream } from "browser-sync";
import ts from "gulp-typescript";
import cSass from "gulp-sass";
import del from "del";

const server = bs.create();

export function clean() {
  return del("dist/**");
}

export function publicFile() {
  return src("public/**").pipe(dest("dist")).pipe(server.stream());
}

export function tsc() {
  return src("src/**.ts")
    .pipe(ts())
    .pipe(dest("dist/js"))
    .pipe(server.stream());
}

export function sass() {
  return src("src/**.scss")
    .pipe(cSass())
    .pipe(dest("dist/css"))
    .pipe(server.stream());
}

export function serve() {
  server.init({
    server: {
      baseDir: "./dist",
    },
  });

  watch("src/**.scss", sass);
  watch("src/**.ts", tsc);
  watch("public/**", publicFile);
  // watch("**.html").on("change", server.reload);
}

export default series(clean, parallel(tsc, sass, publicFile), serve);

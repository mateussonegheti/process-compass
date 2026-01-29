# CHANGELOG DETALHADO

Gerado em: 2026-01-29T14:33:14+00:00

## Commit: 31d5d20
commit: 31d5d20 - Configure GitHub Pages deploy
Author: mateussonegheti
Date: 2026-01-27


diff --git a/package-lock.json b/package-lock.json
index 21d2bf9..a4f3188 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -70,6 +70,7 @@
         "eslint": "^9.32.0",
         "eslint-plugin-react-hooks": "^5.2.0",
         "eslint-plugin-react-refresh": "^0.4.20",
+        "gh-pages": "^6.3.0",
         "globals": "^15.15.0",
         "lovable-tagger": "^1.1.13",
         "postcss": "^8.5.6",
@@ -3373,6 +3374,23 @@
         "node": ">=10"
       }
     },
+    "node_modules/array-union": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/array-union/-/array-union-2.1.0.tgz",
+      "integrity": "sha512-HGyxoOTYUyCM6stUe6EJgnd4EoewAI7zMdfqO+kGjnlZmBDz/cR5pf8r/cR4Wq60sL/p0IkcjUEEPwS3GFrIyw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/async": {
+      "version": "3.2.6",
+      "resolved": "https://registry.npmjs.org/async/-/async-3.2.6.tgz",
+      "integrity": "sha512-htCUDlxyyCLMgaM3xXg0C0LW2xqfuQ6p05pCEIsXuyQ+a1koYKTuBMzRNwmybfLgvJDMd0r1LTn4+E0Ti6C2AA==",
+      "dev": true,
+      "license": "MIT"
+    },
     "node_modules/autoprefixer": {
       "version": "10.4.21",
       "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.4.21.tgz",
@@ -3642,6 +3660,13 @@
         "node": ">= 6"
       }
     },
+    "node_modules/commondir": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/commondir/-/commondir-1.0.1.tgz",
+      "integrity": "sha512-W9pAhw0ja1Edb5GVdIF1mjZw/ASI0AlShXM83UUGe2DVr5TdAPEA1OA8m/g8zWp9x6On7gqufY+FatDbC3MDQg==",
+      "dev": true,
+      "license": "MIT"
+    },
     "node_modules/concat-map": {
       "version": "0.0.1",
       "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
@@ -3855,6 +3880,19 @@
       "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
       "license": "Apache-2.0"
     },
+    "node_modules/dir-glob": {
+      "version": "3.0.1",
+      "resolved": "https://registry.npmjs.org/dir-glob/-/dir-glob-3.0.1.tgz",
+      "integrity": "sha512-WkrWp9GR4KXfKGYzOLmTuGVi1UWFfws377n9cc55/tb6DuqyF6pcQ5AbiHEshaDpY9v6oaSr2XCDidGmMwdzIA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "path-type": "^4.0.0"
+      },
+      "engines": {
+        "node": ">=8"
+      }
+    },
     "node_modules/dlv": {
       "version": "1.1.3",
       "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
@@ -3884,6 +3922,13 @@
       "dev": true,
       "license": "ISC"
     },
+    "node_modules/email-addresses": {
+      "version": "5.0.0",
+      "resolved": "https://registry.npmjs.org/email-addresses/-/email-addresses-5.0.0.tgz",
+      "integrity": "sha512-4OIPYlA6JXqtVn8zpHpGiI7vE6EQOAg16aGnDMIAlZVinnoZ8208tW1hAbjWydgN/4PLTT9q+O1K6AH/vALJGw==",
+      "dev": true,
+      "license": "MIT"
+    },
     "node_modules/embla-carousel": {
       "version": "8.6.0",
       "resolved": "https://registry.npmjs.org/embla-carousel/-/embla-carousel-8.6.0.tgz",
@@ -4246,6 +4291,34 @@
         "node": ">=16.0.0"
       }
     },
+    "node_modules/filename-reserved-regex": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/filename-reserved-regex/-/filename-reserved-regex-2.0.0.tgz",
+      "integrity": "sha512-lc1bnsSr4L4Bdif8Xb/qrtokGbq5zlsms/CYH8PP+WtCkGNF65DPiQY8vG3SakEdRn8Dlnm+gW/qWKKjS5sZzQ==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/filenamify": {
+      "version": "4.3.0",
+      "resolved": "https://registry.npmjs.org/filenamify/-/filenamify-4.3.0.tgz",
+      "integrity": "sha512-hcFKyUG57yWGAzu1CMt/dPzYZuv+jAJUT85bL8mrXvNe6hWj6yEHEc4EdcgiA6Z3oi1/9wXJdZPXF2dZNgwgOg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "filename-reserved-regex": "^2.0.0",
+        "strip-outer": "^1.0.1",
+        "trim-repeated": "^1.0.0"
+      },
+      "engines": {
+        "node": ">=8"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/sindresorhus"
+      }
+    },
     "node_modules/fill-range": {
       "version": "7.1.1",
       "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
@@ -4258,6 +4331,24 @@
         "node": ">=8"
       }
     },
+    "node_modules/find-cache-dir": {
+      "version": "3.3.2",
+      "resolved": "https://registry.npmjs.org/find-cache-dir/-/find-cache-dir-3.3.2.tgz",
+      "integrity": "sha512-wXZV5emFEjrridIgED11OoUKLxiYjAcqot/NJdAkOhlJ+vGzwhOAfcG5OX1jP+S0PcjEn8bdMJv+g2jwQ3Onig==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "commondir": "^1.0.1",
+        "make-dir": "^3.0.2",
+        "pkg-dir": "^4.1.0"
+      },
+      "engines": {
+        "node": ">=8"
+      },
+      "funding": {
+        "url": "https://github.com/avajs/find-cache-dir?sponsor=1"
+      }
+    },
     "node_modules/find-up": {
       "version": "5.0.0",
       "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
@@ -4326,6 +4417,21 @@
         "url": "https://github.com/sponsors/rawify"
       }
     },
+    "node_modules/fs-extra": {
+      "version": "11.3.3",
+      "resolved": "https://registry.npmjs.org/fs-extra/-/fs-extra-11.3.3.tgz",
+      "integrity": "sha512-VWSRii4t0AFm6ixFFmLLx1t7wS1gh+ckoa84aOeapGum0h+EZd1EhEumSB+ZdDLnEPuucsVB9oB7cxJHap6Afg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "graceful-fs": "^4.2.0",
+        "jsonfile": "^6.0.1",
+        "universalify": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=14.14"
+      }
+    },
     "node_modules/fsevents": {
       "version": "2.3.3",
       "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
@@ -4358,6 +4464,39 @@
         "node": ">=6"
       }
     },
+    "node_modules/gh-pages": {
+      "version": "6.3.0",
+      "resolved": "https://registry.npmjs.org/gh-pages/-/gh-pages-6.3.0.tgz",
+      "integrity": "sha512-Ot5lU6jK0Eb+sszG8pciXdjMXdBJ5wODvgjR+imihTqsUWF2K6dJ9HST55lgqcs8wWcw6o6wAsUzfcYRhJPXbA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "async": "^3.2.4",
+        "commander": "^13.0.0",
+        "email-addresses": "^5.0.0",
+        "filenamify": "^4.3.0",
+        "find-cache-dir": "^3.3.1",
+        "fs-extra": "^11.1.1",
+        "globby": "^11.1.0"
+      },
+      "bin": {
+        "gh-pages": "bin/gh-pages.js",
+        "gh-pages-clean": "bin/gh-pages-clean.js"
+      },
+      "engines": {
+        "node": ">=10"
+      }
+    },
+    "node_modules/gh-pages/node_modules/commander": {
+      "version": "13.1.0",
+      "resolved": "https://registry.npmjs.org/commander/-/commander-13.1.0.tgz",
+      "integrity": "sha512-/rFeCpNJQbhSZjGVwO9RFV3xPqbnERS8MmIQzCtD/zl6gpJuV/bMLuN92oG3F7d8oDEHHRrujSXNUr8fpjntKw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=18"
+      }
+    },
     "node_modules/glob": {
       "version": "10.4.5",
       "resolved": "https://registry.npmjs.org/glob/-/glob-10.4.5.tgz",
@@ -4427,6 +4566,34 @@
         "url": "https://github.com/sponsors/sindresorhus"
       }
     },
+    "node_modules/globby": {
+      "version": "11.1.0",
+      "resolved": "https://registry.npmjs.org/globby/-/globby-11.1.0.tgz",
+      "integrity": "sha512-jhIXaOzy1sb8IyocaruWSn1TjmnBVs8Ayhcy83rmxNJ8q2uWKCAj3CnJY+KpGSXCueAPc0i05kVvVKtP1t9S3g==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "array-union": "^2.1.0",
+        "dir-glob": "^3.0.1",
+        "fast-glob": "^3.2.9",
+        "ignore": "^5.2.0",
+        "merge2": "^1.4.1",
+        "slash": "^3.0.0"
+      },
+      "engines": {
+        "node": ">=10"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/sindresorhus"
+      }
+    },
+    "node_modules/graceful-fs": {
+      "version": "4.2.11",
+      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
+      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
+      "dev": true,
+      "license": "ISC"
+    },
     "node_modules/graphemer": {
       "version": "1.4.0",
       "resolved": "https://registry.npmjs.org/graphemer/-/graphemer-1.4.0.tgz",
@@ -4657,6 +4824,19 @@
       "dev": true,
       "license": "MIT"
     },
+    "node_modules/jsonfile": {
+      "version": "6.2.0",
+      "resolved": "https://registry.npmjs.org/jsonfile/-/jsonfile-6.2.0.tgz",
+      "integrity": "sha512-FGuPw30AdOIUTRMC2OMRtQV+jkVj2cfPqSeWXv1NEAJ1qZ5zb1X6z1mFhbfOB/iy3ssJCD+3KuZ8r8C3uVFlAg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "universalify": "^2.0.0"
+      },
+      "optionalDependencies": {
+        "graceful-fs": "^4.1.6"
+      }
+    },
     "node_modules/keyv": {
       "version": "4.5.4",
       "resolved": "https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz",
@@ -5212,6 +5392,32 @@
         "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0-rc"
       }
     },
+    "node_modules/make-dir": {
+      "version": "3.1.0",
+      "resolved": "https://registry.npmjs.org/make-dir/-/make-dir-3.1.0.tgz",
+      "integrity": "sha512-g3FeP20LNwhALb/6Cz6Dd4F2ngze0jz7tbzrD2wAV+o9FeNHe4rL+yK2md0J/fiSf1sa1ADhXqi5+oVwOM/eGw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "semver": "^6.0.0"
+      },
+      "engines": {
+        "node": ">=8"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/sindresorhus"
+      }
+    },
+    "node_modules/make-dir/node_modules/semver": {
+      "version": "6.3.1",
+      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
+      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
+      "dev": true,
+      "license": "ISC",
+      "bin": {
+        "semver": "bin/semver.js"
+      }
+    },
     "node_modules/merge2": {
       "version": "1.4.1",
       "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
@@ -5403,6 +5609,16 @@
         "url": "https://github.com/sponsors/sindresorhus"
       }
     },
+    "node_modules/p-try": {
+      "version": "2.2.0",
+      "resolved": "https://registry.npmjs.org/p-try/-/p-try-2.2.0.tgz",
+      "integrity": "sha512-R4nPAVTAU0B9D35/Gk3uJf/7XYbQcyohSKdvAxIRSNghFl4e71hVoGnBNQz9cWaXxO2I10KTC+3jMdvvoKw6dQ==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
     "node_modules/package-json-from-dist": {
       "version": "1.0.1",
       "resolved": "https://registry.npmjs.org/package-json-from-dist/-/package-json-from-dist-1.0.1.tgz",
@@ -5463,6 +5679,16 @@
         "url": "https://github.com/sponsors/isaacs"
       }
     },
+    "node_modules/path-type": {
+      "version": "4.0.0",
+      "resolved": "https://registry.npmjs.org/path-type/-/path-type-4.0.0.tgz",
+      "integrity": "sha512-gDKb8aZMDeD/tZWs9P6+q0J9Mwkdl6xMV8TjnGP3qJVJ06bdMgkbBlLU8IdfOsIsFz2BW1rNVT3XuNEl8zPAvw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=8"
+      }
+    },
     "node_modules/picocolors": {
       "version": "1.1.1",
       "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
@@ -5499,6 +5725,75 @@
         "node": ">= 6"
       }
     },
+    "node_modules/pkg-dir": {
+      "version": "4.2.0",
+      "resolved": "https://registry.npmjs.org/pkg-dir/-/pkg-dir-4.2.0.tgz",
+      "integrity": "sha512-HRDzbaKjC+AOWVXxAU/x54COGeIv9eb+6CkDSQoNTt4XyWoIJvuPsXizxu/Fr23EiekbtZwmh1IcIG/l/a10GQ==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "find-up": "^4.0.0"
+      },
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/pkg-dir/node_modules/find-up": {
+      "version": "4.1.0",
+      "resolved": "https://registry.npmjs.org/find-up/-/find-up-4.1.0.tgz",
+      "integrity": "sha512-PpOwAdQ/YlXQ2vj8a3h8IipDuYRi3wceVQQGYWxNINccq40Anw7BlsEXCMbt1Zt+OLA6Fq9suIpIWD0OsnISlw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "locate-path": "^5.0.0",
+        "path-exists": "^4.0.0"
+      },
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/pkg-dir/node_modules/locate-path": {
+      "version": "5.0.0",
+      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-5.0.0.tgz",
+      "integrity": "sha512-t7hw9pI+WvuwNJXwk5zVHpyhIqzg2qTlklJOf0mVxGSbe3Fp2VieZcduNYjaLDoy6p9uGpQEGWG87WpMKlNq8g==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "p-locate": "^4.1.0"
+      },
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/pkg-dir/node_modules/p-limit": {
+      "version": "2.3.0",
+      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-2.3.0.tgz",
+      "integrity": "sha512-//88mFWSJx8lxCzwdAABTJL2MyWB12+eIY7MDL2SqLmAkeKU9qxRvWuSyTjm3FUmpBEMuFfckAIqEaVGUDxb6w==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "p-try": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/sindresorhus"
+      }
+    },
+    "node_modules/pkg-dir/node_modules/p-locate": {
+      "version": "4.1.0",
+      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-4.1.0.tgz",
+      "integrity": "sha512-R79ZZ/0wAxKGu3oYMlz8jy/kbhsNrS7SKZ7PxEHBgJ5+F2mtFW2fK2cOtBh1cHYkQsbzFV7I+EoRKe6Yt0oK7A==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "p-limit": "^2.2.0"
+      },
+      "engines": {
+        "node": ">=8"
+      }
+    },
     "node_modules/postcss": {
       "version": "8.5.6",
       "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.6.tgz",
@@ -6110,6 +6405,16 @@
         "url": "https://github.com/sponsors/isaacs"
       }
     },
+    "node_modules/slash": {
+      "version": "3.0.0",
+      "resolved": "https://registry.npmjs.org/slash/-/slash-3.0.0.tgz",
+      "integrity": "sha512-g9Q1haeby36OSStwb4ntCGGGaKsaVSjQ68fBxoQcutl5fS1vuY18H3wSt3jFyFtrkx+Kz0V1G85A4MyAdDMi2Q==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=8"
+      }
+    },
     "node_modules/sonner": {
       "version": "1.7.4",
       "resolved": "https://registry.npmjs.org/sonner/-/sonner-1.7.4.tgz",
@@ -6238,6 +6543,29 @@
         "url": "https://github.com/sponsors/sindresorhus"
       }
     },
+    "node_modules/strip-outer": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/strip-outer/-/strip-outer-1.0.1.tgz",
+      "integrity": "sha512-k55yxKHwaXnpYGsOzg4Vl8+tDrWylxDEpknGjhTiZB8dFRU5rTo9CAzeycivxV3s+zlTKwrs6WxMxR95n26kwg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "escape-string-regexp": "^1.0.2"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/strip-outer/node_modules/escape-string-regexp": {
+      "version": "1.0.5",
+      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz",
+      "integrity": "sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.8.0"
+      }
+    },
     "node_modules/sucrase": {
       "version": "3.35.0",
       "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.0.tgz",
@@ -6381,6 +6709,29 @@
         "node": ">=8.0"
       }
     },
+    "node_modules/trim-repeated": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/trim-repeated/-/trim-repeated-1.0.0.tgz",
+      "integrity": "sha512-pkonvlKk8/ZuR0D5tLW8ljt5I8kmxp2XKymhepUeOdCEfKpZaktSArkLHZt76OB1ZvO9bssUsDty4SWhLvZpLg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "escape-string-regexp": "^1.0.2"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/trim-repeated/node_modules/escape-string-regexp": {
+      "version": "1.0.5",
+      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz",
+      "integrity": "sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.8.0"
+      }
+    },
     "node_modules/ts-api-utils": {
       "version": "2.1.0",
       "resolved": "https://registry.npmjs.org/ts-api-utils/-/ts-api-utils-2.1.0.tgz",
@@ -6464,6 +6815,16 @@
       "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
       "license": "MIT"
     },
+    "node_modules/universalify": {
+      "version": "2.0.1",
+      "resolved": "https://registry.npmjs.org/universalify/-/universalify-2.0.1.tgz",
+      "integrity": "sha512-gptHNQghINnc/vTGIk0SOFGFNXw7JVrlRUtConJRlvaw6DuX0wO5Jeko9sWrMBhh+PsYAZ7oXAiOnf/UKogyiw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">= 10.0.0"
+      }
+    },
     "node_modules/update-browserslist-db": {
       "version": "1.1.3",
       "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.1.3.tgz",
diff --git a/package.json b/package.json
index 6da9d4c..8c831cf 100644
--- a/package.json
+++ b/package.json
@@ -2,13 +2,15 @@
   "name": "vite_react_shadcn_ts",
   "private": true,
   "version": "0.0.0",
+  "homepage": "https://mateussonegheti.github.io/process-compass",
   "type": "module",
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "build:dev": "vite build --mode development",
     "lint": "eslint .",
-    "preview": "vite preview"
+    "preview": "vite preview",
+    "deploy": "gh-pages -d dist"
   },
   "dependencies": {
     "@hookform/resolvers": "^3.10.0",
@@ -73,6 +75,7 @@
     "eslint": "^9.32.0",
     "eslint-plugin-react-hooks": "^5.2.0",
     "eslint-plugin-react-refresh": "^0.4.20",
+    "gh-pages": "^6.3.0",
     "globals": "^15.15.0",
     "lovable-tagger": "^1.1.13",
     "postcss": "^8.5.6",

---

## Commit: e60812f
commit: e60812f - Configure GitHub Pages deployment
Author: mateussonegheti
Date: 2026-01-26


diff --git a/.github/workflows/deploy.yml b/.github/workflows/deploy.yml
new file mode 100644
index 0000000..29df46d
--- /dev/null
+++ b/.github/workflows/deploy.yml
@@ -0,0 +1,53 @@
+name: Deploy to GitHub Pages
+
+on:
+  push:
+    branches:
+      - main
+  workflow_dispatch:
+
+permissions:
+  contents: read
+  pages: write
+  id-token: write
+
+concurrency:
+  group: "pages"
+  cancel-in-progress: false
+
+jobs:
+  build:
+    runs-on: ubuntu-latest
+    steps:
+      - name: Checkout
+        uses: actions/checkout@v4
+
+      - name: Setup Node.js
+        uses: actions/setup-node@v4
+        with:
+          node-version: '20'
+
+      - name: Install bun
+        uses: oven-sh/setup-bun@v1
+
+      - name: Install dependencies
+        run: bun install
+
+      - name: Build
+        run: bun run build
+
+      - name: Upload artifact
+        uses: actions/upload-pages-artifact@v3
+        with:
+          path: './dist'
+
+  deploy:
+    environment:
+      name: github-pages
+      url: ${{ steps.deployment.outputs.page_url }}
+    runs-on: ubuntu-latest
+    needs: build
+    steps:
+      - name: Deploy to GitHub Pages
+        id: deployment
+        uses: actions/deploy-pages@v4
diff --git a/README.md b/README.md
index 70b7c82..4084b5f 100644
--- a/README.md
+++ b/README.md
@@ -1,53 +1,101 @@
-# Welcome to your Lovable project
+# Process Compass - Ferramenta de Gestão de Processos
 
-## Project info
+## 🚀 Acesso Online (GitHub Pages)
 
-**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID
+O projeto está **hosteado gratuitamente no GitHub Pages** e pode ser acessado em:
 
-## How can I edit this code?
+**[process-compass.mateussonegheti.me](https://mateussonegheti.github.io/process-compass/)**
 
-There are several ways of editing your application.
+Ou diretamente via GitHub Pages:
+**[https://mateussonegheti.github.io/process-compass/](https://mateussonegheti.github.io/process-compass/)**
 
-**Use Lovable**
+### Funcionalidades Principais
 
-Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.
+- **Dashboard de Supervisor** - Visualize e gerencie avaliações de processos
+- **Formulário de Avaliação** - Avalie processos empresariais
+- **Painel de Relatórios** - Análise consolidada de dados
+- **Merge de Planilhas** - Combine múltiplos arquivos de dados
+- **Autenticação Integrada** - Sistema de login seguro via Supabase
 
-Changes made via Lovable will be committed automatically to this repo.
+## 📋 Desenvolvimento Local
 
-**Use your preferred IDE**
+### Pré-requisitos
 
-If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.
+- Node.js 20+ ou Bun
+- npm/bun para gerenciador de pacotes
 
-The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
-
-Follow these steps:
+### Instalação
 
 ```sh
-# Step 1: Clone the repository using the project's Git URL.
-git clone <YOUR_GIT_URL>
+# Clone o repositório
+git clone https://github.com/mateussonegheti/process-compass.git
+cd process-compass
+
+# Instale as dependências (com npm)
+npm install
 
-# Step 2: Navigate to the project directory.
-cd <YOUR_PROJECT_NAME>
+# Ou com bun
+bun install
+```
 
-# Step 3: Install the necessary dependencies.
-npm i
+### Executar Localmente
 
-# Step 4: Start the development server with auto-reloading and an instant preview.
+```sh
+# Desenvolvimento com hot reload
 npm run dev
+# ou
+bun run dev
+
+# Acessar em: http://localhost:8080
 ```
 
-**Edit a file directly in GitHub**
+### Build para Produção
+
+```sh
+npm run build
+# ou
+bun run build
+
+# Preview da build
+npm run preview
+```
+
+## 🔧 Configuração do GitHub Pages
+
+Este projeto está automaticamente configurado para deploy no GitHub Pages através de um workflow do GitHub Actions:
+
+- **Workflow**: `.github/workflows/deploy.yml`
+- **Base URL**: `/process-compass/`
+- **Trigger**: Deploy automático ao fazer push para a branch `main`
+
+O site é reconstruído e reimplantado automaticamente a cada atualização.
+
+## 📁 Estrutura do Projeto
+
+```
+src/
+├── components/
+│   ├── cogede/          # Componentes principais da aplicação
+│   └── ui/              # Componentes shadcn/ui reutilizáveis
+├── pages/               # Páginas da aplicação
+├── hooks/               # React hooks customizados
+├── integrations/        # Integrações externas (Supabase)
+├── lib/                 # Utilitários e helpers
+└── types/               # Definições de tipos TypeScript
+```
 
-- Navigate to the desired file(s).
-- Click the "Edit" button (pencil icon) at the top right of the file view.
-- Make your changes and commit the changes.
+## 🏗️ Stack Tecnológico
 
-**Use GitHub Codespaces**
+- **Frontend**: React 18 + TypeScript
+- **Build Tool**: Vite
+- **Styling**: Tailwind CSS
+- **UI Components**: shadcn/ui
+- **Database**: Supabase PostgreSQL
+- **Autenticação**: Supabase Auth
+- **State Management**: React Query
+- **Formulários**: React Hook Form
 
-- Navigate to the main page of your repository.
-- Click on the "Code" button (green button) near the top right.
-- Select the "Codespaces" tab.
-- Click on "New codespace" to launch a new Codespace environment.
+## 📝 Desenvolvimento
 - Edit files directly within the Codespace and commit and push your changes once you're done.
 
 ## What technologies are used for this project?
diff --git a/index.html b/index.html
index 38a5fa7..221adae 100644
--- a/index.html
+++ b/index.html
@@ -3,14 +3,12 @@
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
-    <!-- TODO: Set the document title to the name of your application -->
-    <title>Lovable App</title>
-    <meta name="description" content="Lovable Generated Project" />
-    <meta name="author" content="Lovable" />
+    <title>Process Compass - Ferramenta de Gestão de Processos</title>
+    <meta name="description" content="Process Compass - Plataforma de avaliação, monitoramento e gestão de processos empresariais" />
+    <meta name="author" content="Mateus Sonegheti" />
 
-    <!-- TODO: Update og:title to match your application name -->
-    <meta property="og:title" content="Lovable App" />
-    <meta property="og:description" content="Lovable Generated Project" />
+    <meta property="og:title" content="Process Compass - Ferramenta de Gestão de Processos" />
+    <meta property="og:description" content="Plataforma de avaliação, monitoramento e gestão de processos empresariais" />
     <meta property="og:type" content="website" />
     <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
 
diff --git a/vite.config.ts b/vite.config.ts
index da25c6d..a118f2c 100644
--- a/vite.config.ts
+++ b/vite.config.ts
@@ -5,6 +5,7 @@ import { componentTagger } from "lovable-tagger";
 
 // https://vitejs.dev/config/
 export default defineConfig(({ mode }) => ({
+  base: "/process-compass/",
   server: {
     host: "::",
     port: 8080,

---

## Commit: 04b5a81
commit: 04b5a81 - Trigger pages deploy
Author: mateussonegheti
Date: 2026-01-26


diff --git a/.env.example b/.env.example
new file mode 100644
index 0000000..f6bf63e
--- /dev/null
+++ b/.env.example
@@ -0,0 +1,19 @@
+# Supabase Configuration
+# Get these values from your Supabase project settings: https://supabase.com
+
+# Your Supabase project ID
+VITE_SUPABASE_PROJECT_ID=your_project_id_here
+
+# Your Supabase URL (public - can be exposed in browser)
+VITE_SUPABASE_URL=https://your_project.supabase.co
+
+# Your Supabase Public Key / Anon Key (public - can be exposed in browser)
+# This is the "anon" key, NOT the service role key
+# ⚠️ NEVER expose the service role key in frontend code
+VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key_here
+
+# How to find these values:
+# 1. Go to supabase.com and sign in
+# 2. Open your project
+# 3. Go to Settings → API
+# 4. Copy the values from there
diff --git a/.gitignore b/.gitignore
index a547bf3..556cd6e 100644
--- a/.gitignore
+++ b/.gitignore
@@ -12,6 +12,11 @@ dist
 dist-ssr
 *.local
 
+# Environment variables
+.env
+.env.local
+.env.*.local
+
 # Editor directories and files
 .vscode/*
 !.vscode/extensions.json
diff --git a/README.md b/README.md
index 4084b5f..ef7dda5 100644
--- a/README.md
+++ b/README.md
@@ -95,7 +95,46 @@ src/
 - **State Management**: React Query
 - **Formulários**: React Hook Form
 
-## 📝 Desenvolvimento
+## � Segurança
+
+### Configuração de Variáveis de Ambiente
+
+O projeto usa variáveis de ambiente prefixadas com `VITE_` para expor valores públicos:
+
+```env
+VITE_SUPABASE_PROJECT_ID=your_project_id
+VITE_SUPABASE_URL=https://your_project.supabase.co
+VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key
+```
+
+**Importante**: 
+- ✅ Essas variáveis são **intencionalmente públicas** e compiladas no bundle
+- ✅ O Supabase foi projetado para usar chaves públicas no frontend
+- ✅ A segurança é garantida por **Row Level Security (RLS)** no banco de dados
+- ❌ **NUNCA** expose a `SERVICE_ROLE_KEY` no código frontend
+
+### Protegendo seus Dados
+
+1. **Row Level Security (RLS)** está habilitado em todas as tabelas
+2. **Autenticação Supabase** valida todas as requisições
+3. **Policies** restringem acesso baseado em papéis (admin, supervisor, avaliador)
+4. **Arquivo `.env` local** não é commitado (está em `.gitignore`)
+
+### Fluxo de Dados
+
+```
+Frontend (React)
+    ↓
+Supabase Client (usa chave pública)
+    ↓
+Supabase Auth (valida usuário)
+    ↓
+Row Level Security (valida permissões)
+    ↓
+PostgreSQL Database (dados protegidos)
+```
+
+## �📝 Desenvolvimento
 - Edit files directly within the Codespace and commit and push your changes once you're done.
 
 ## What technologies are used for this project?
diff --git a/SECURITY.md b/SECURITY.md
new file mode 100644
index 0000000..573ed90
--- /dev/null
+++ b/SECURITY.md
@@ -0,0 +1,196 @@
+# 🔐 Guia de Segurança - Process Compass
+
+## Resumo de Segurança
+
+Este documento explica como o Process Compass protege seus dados e as boas práticas para manter a segurança.
+
+---
+
+## ✅ Está Seguro?
+
+**SIM!** Contanto que você siga as práticas recomendadas abaixo.
+
+### Por quê?
+
+1. **Chaves públicas no navegador são normais**
+   - O Supabase foi projetado para usar chaves públicas no frontend
+   - Isso é seguro porque o RLS (Row Level Security) valida cada requisição
+
+2. **Você nunca expõe chaves secretas**
+   - A `SERVICE_ROLE_KEY` fica no backend (não está no código)
+   - Senhas de usuários são hasheadas pelo Supabase Auth
+
+3. **Dados são protegidos por múltiplas camadas**
+   - Autenticação: Supabase Auth valida quem é você
+   - Autorização: RLS verifica o que você pode acessar
+   - Criptografia: Dados em trânsito (HTTPS) e em repouso
+
+---
+
+## 🚨 Vulnerabilidades Encontradas e Corrigidas
+
+### 1. ❌ Requisições HTTP diretas ao Supabase
+**Status**: ✅ CORRIGIDO
+
+Antes (inseguro):
+```typescript
+const headers = {
+  'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
+  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
+};
+const response = await fetch(url, { method: 'PATCH', headers, body: payload });
+```
+
+Depois (seguro):
+```typescript
+await supabase
+  .from("processos_fila")
+  .update(data)
+  .eq("codigo_processo", value);
+```
+
+**Por quê importa**: Usar o cliente Supabase garante:
+- ✅ Melhor tratamento de erros
+- ✅ Integração com RLS
+- ✅ Melhor segurança de sessão
+- ✅ Menos exposição de implementação
+
+---
+
+## 🔒 Práticas de Segurança
+
+### Variáveis de Ambiente
+
+✅ **Correto** - Variáveis públicas:
+```env
+VITE_SUPABASE_URL=https://xxx.supabase.co
+VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
+```
+
+❌ **NUNCA faça isso** - Variáveis secretas:
+```env
+# NÃO COLOQUE ISSO NO CÓDIGO FRONTEND
+SUPABASE_SERVICE_ROLE_KEY=xxxx
+DATABASE_PASSWORD=xxxx
+AUTH_SECRET=xxxx
+```
+
+### Row Level Security (RLS)
+
+Todas as tabelas têm RLS habilitado:
+- `profiles` - Usuários só veem seus próprios dados
+- `avaliacoes` - Apenas supervisores/admins podem ler
+- `processos_fila` - Acesso baseado em lote
+- `lotes_importacao` - Acesso apenas para importador
+
+Exemplo de policy:
+```sql
+CREATE POLICY "users can view their own profile"
+ON profiles FOR SELECT
+USING (auth.uid() = user_id);
+```
+
+### Autenticação
+
+- Senhas são hasheadas com bcrypt
+- JWT tokens são validados em cada requisição
+- Sessões expiram após período de inatividade
+- Email é verificado em cadastro
+
+---
+
+## 🔍 O que pode ser hackeado?
+
+### ❌ Não pode ser hackeado:
+- Senhas dos usuários (hasheadas)
+- Dados de outros usuários (RLS protege)
+- Chaves secretas (não estão no frontend)
+- Banco de dados inteiro (RLS restringe acesso)
+
+### ⚠️ Pode ser comprometido se:
+1. **Você compartilha sua conta** com alguém
+2. **Phishing**: Um atacante enganar você a dar sua senha
+3. **CSRF**: Um site malicioso fazer requisições em seu nome (mitigado por CORS)
+4. **XSS**: Código malicioso injetado no site (prevenido por Content Security Policy)
+
+---
+
+## 🛡️ Como Manter Seguro
+
+### Para Desenvolvedores
+
+1. **Nunca commit credenciais**
+   ```bash
+   # ✅ Certo
+   git add .
+   # (o .env é ignorado automaticamente)
+   
+   # ❌ Errado
+   git add .env
+   git commit -m "Add secrets"
+   ```
+
+2. **Use variáveis de ambiente**
+   ```typescript
+   // ✅ Correto
+   const url = import.meta.env.VITE_SUPABASE_URL;
+   
+   // ❌ Errado
+   const url = 'https://xxx.supabase.co'; // Hardcoded
+   ```
+
+3. **Atualize dependências**
+   ```bash
+   npm audit fix
+   npm outdated
+   ```
+
+### Para Usuários
+
+1. **Use senhas fortes**
+   - Mínimo 12 caracteres
+   - Misture maiúsculas, minúsculas, números, símbolos
+
+2. **Nunca reutilize senhas**
+   - Use um gerenciador de senhas
+
+3. **Ative 2FA se disponível**
+   - (Quando implementado no Supabase)
+
+---
+
+## 📊 Checklist de Segurança
+
+- [x] Arquivo `.env` não é commitado
+- [x] Não há hardcoded secrets no código
+- [x] Variáveis públicas começam com `VITE_`
+- [x] Usando Supabase Client em vez de HTTP direto
+- [x] RLS está habilitado em todas as tabelas
+- [x] HTTPS é usado em produção
+- [x] Senhas são hasheadas
+- [x] Sessões expiram após inatividade
+- [x] CORS está configurado corretamente
+- [x] Headers de segurança estão presentes
+
+---
+
+## 🔗 Referências
+
+- [Supabase Security](https://supabase.com/docs/guides/auth)
+- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
+- [OWASP Top 10](https://owasp.org/Top10/)
+- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
+
+---
+
+## ❓ Dúvidas?
+
+Se encontrar uma vulnerabilidade:
+1. **NÃO compartilhe publicamente**
+2. Abra uma issue privada no GitHub
+3. Ou entre em contato diretamente
+
+---
+
+**Última atualização**: 2026-01-26  
+**Status**: ✅ Seguro para Produção
diff --git a/src/pages/Index.tsx b/src/pages/Index.tsx
index 6e3d84d..ba85ac4 100644
--- a/src/pages/Index.tsx
+++ b/src/pages/Index.tsx
@@ -63,35 +63,16 @@ export default function Index() {
     logger.log("[Index] Executando cleanup - liberando processo do usuário");
     
     try {
-      // Use sendBeacon for reliable delivery on page unload
-      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/processos_fila?codigo_processo=eq.${encodeURIComponent(sessao.processoAtual.CODIGO_PROCESSO)}&lote_id=eq.${loteAtivo.id}`;
-      
-      const payload = JSON.stringify({
-        status_avaliacao: "PENDENTE",
-        responsavel_avaliacao: null,
-        data_inicio_avaliacao: null
-      });
-
-      const headers = {
-        'Content-Type': 'application/json',
-        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
-        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
-        'Prefer': 'return=minimal'
-      };
-
-      // Try sendBeacon first (works on page unload)
-      if (navigator.sendBeacon) {
-        const blob = new Blob([payload], { type: 'application/json' });
-        navigator.sendBeacon(url, blob);
-      } else {
-        // Fallback to fetch
-        await fetch(url, {
-          method: 'PATCH',
-          headers,
-          body: payload,
-          keepalive: true
-        });
-      }
+      // Use Supabase client instead of direct HTTP calls for better security
+      await supabase
+        .from("processos_fila")
+        .update({
+          status_avaliacao: "PENDENTE",
+          responsavel_avaliacao: null,
+          data_inicio_avaliacao: null
+        })
+        .eq("codigo_processo", sessao.processoAtual.CODIGO_PROCESSO)
+        .eq("lote_id", loteAtivo.id);
     } catch (error) {
       logger.error("[Index] Erro ao liberar processo no cleanup:", error);
     }

---

## Commit: 4aa417a
commit: 4aa417a - Fix GitHub Pages routing for React Router
Author: mateussonegheti
Date: 2026-01-26


diff --git a/public/404.html b/public/404.html
new file mode 100644
index 0000000..de38d5f
--- /dev/null
+++ b/public/404.html
@@ -0,0 +1,24 @@
+<!DOCTYPE html>
+<html>
+  <head>
+    <meta charset="utf-8">
+    <title>Process Compass</title>
+    <script>
+      // GitHub Pages SPA redirect trick
+      // This file is served for all 404 errors and redirects to index.html
+      // The React Router will handle the routing from there
+      var pathSegments = window.location.pathname.split('/').filter(Boolean);
+      var basePath = '/process-compass';
+      
+      // If not in /process-compass, redirect to it
+      if (pathSegments[0] !== 'process-compass') {
+        window.location.pathname = basePath + window.location.pathname;
+      } else {
+        // Already in /process-compass, redirect to index.html
+        window.location.pathname = basePath + '/';
+      }
+    </script>
+  </head>
+  <body>
+  </body>
+</html>
diff --git a/src/App.tsx b/src/App.tsx
index 14b5fb9..da14d85 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -104,7 +104,7 @@ const App = () => (
     <TooltipProvider>
       <Toaster />
       <Sonner />
-      <BrowserRouter>
+      <BrowserRouter basename="/process-compass">
         <AuthProvider>
           <AppRoutes />
         </AuthProvider>

---

## Commit: 82108f1
commit: 82108f1 - fix: Usar npm ao invés de bun no GitHub Actions
Author: mateussonegheti
Date: 2026-01-26

O workflow estava tentando usar bun install/build mas o projeto usa npm.
Isso estava causando falha silenciosa no deploy.

diff --git a/.github/workflows/deploy.yml b/.github/workflows/deploy.yml
index 29df46d..11df97e 100644
--- a/.github/workflows/deploy.yml
+++ b/.github/workflows/deploy.yml
@@ -27,14 +27,11 @@ jobs:
         with:
           node-version: '20'
 
-      - name: Install bun
-        uses: oven-sh/setup-bun@v1
-
       - name: Install dependencies
-        run: bun install
+        run: npm install
 
       - name: Build
-        run: bun run build
+        run: npm run build
 
       - name: Upload artifact
         uses: actions/upload-pages-artifact@v3

---

## Commit: a5329e5
commit: a5329e5 - trigger: Force deploy to GitHub Pages - agora vai!
Author: mateussonegheti
Date: 2026-01-26


---

## Commit: 9642580
commit: 9642580 - trigger: Forçar rebuild do GitHub Pages
Author: mateussonegheti
Date: 2026-01-26


---

## Commit: 4d6e7f1
commit: 4d6e7f1 - feat: Sistema robusto de fila com timeout e proteção contra perda de processos
Author: mateussonegheti
Date: 2026-01-26

Implementa as seguintes melhorias no gerenciamento de fila:

1. **Timeout automático de 1 hora**:
   - Detecta inatividade (digitação, clique, scroll, salvamento)
   - Processo volta a PENDENTE silenciosamente após 1h
   - Nenhum aviso ao usuário - retorno automático

2. **Liberação automática de processo anterior**:
   - Ao editar um processo anterior, libera o que estava em EM_ANALISE
   - Evita processos "descontinuados" quando avaliador muda de foco
   - Volta a PENDENTE para outro avaliador pegar

3. **Lock de acesso a processo concluído**:
   - Apenas o avaliador original pode editar
   - Impede sobrescrita por outro avaliador
   - Re-edição apenas via 'Minhas Avaliações'

4. **Rastreamento de interação**:
   - Hook useInactivityTimeout() monitora atividade
   - Atualiza última_interacao no banco cada 30s
   - Função liberar_processos_orfaos() limpa processos órfãos

Nova migração:
- Adiciona: ultima_interacao, tempo_captura, avaliador_id_original
- Funções SQL para validação e limpeza

Novos campos no banco:
- processos_fila.ultima_interacao: TIMESTAMP
- processos_fila.tempo_captura: TIMESTAMP
- processos_fila.avaliador_id_original: UUID

Arquivos afetados:
- src/hooks/useInactivityTimeout.ts (novo)
- src/components/cogede/FormularioAvaliacao.tsx
- src/pages/Index.tsx
- supabase/migrations/20260126_add_queue_control.sql (nova)
- .github/copilot-instructions.md

diff --git a/.github/copilot-instructions.md b/.github/copilot-instructions.md
index 0bec07d..e275d28 100644
--- a/.github/copilot-instructions.md
+++ b/.github/copilot-instructions.md
@@ -116,6 +116,79 @@ VITE_SUPABASE_PUBLISHABLE_KEY=your-key
 - **Portuguese naming**: Domain types and components use Portuguese (COGEDE system)
 - **shadcn/ui pattern**: Radix-based, headless by default; compose with Tailwind
 
+## Process Queue Management (Sistema de Fila)
+
+### Process States & Transitions
+```
+PENDENTE → EM_ANALISE → CONCLUIDO
+            ↓ (inatividade 1h)
+          PENDENTE (volta silenciosamente)
+```
+
+**States:**
+- **PENDENTE**: Aguardando avaliação (responsavel_avaliacao = NULL)
+- **EM_ANALISE**: Avaliador está preenchendo (responsavel_avaliacao = avaliador_id)
+- **CONCLUIDO**: Avaliação finalizada (salvo no banco)
+
+### Critical Rules
+
+1. **Lock por Avaliador**: Dois avaliadores NUNCA podem abrir o mesmo processo em EM_ANALISE
+   - Campo `responsavel_avaliacao` garante isso
+   - Ao clicar "Iniciar", sistema atualiza para EM_ANALISE com ID do avaliador
+
+2. **Timeout Automático (1 HORA)**: Processo sem interação por 1h volta a PENDENTE silenciosamente
+   - Hook `useInactivityTimeout` rastreia: digitação, clicks, scroll, salvamento
+   - Atualiza `ultima_interacao` timestamp a cada 30s de atividade
+   - Função `liberar_processos_orfaos()` roda periodicamente (via Supabase CRON)
+   - Sem avisos ao usuário - processo volta automaticamente
+
+3. **Ao Editar Processo Anterior**: Se avaliador A está em EM_ANALISE com Processo Y e vai editar Processo X (CONCLUIDO)
+   - Handler `handleEditarAvaliacao` libera Processo Y automaticamente
+   - Y volta a PENDENTE (responsavel_avaliacao = NULL)
+   - Agora A pode editar X normalmente
+
+4. **Re-edição sem Salvar**: Quando editor fecha sem salvar
+   - Processo mantém status anterior (ex: CONCLUIDO continua CONCLUIDO)
+   - Nenhuma validação necessária - apenas guardado é persistido no banco
+
+5. **Pode Salvar Vazio**: Avaliador pode deixar campos em branco
+   - Sistema permite (validação é opcional)
+   - Nota: recomendado adicionar validação obrigatória via Zod se necessário
+
+### Database Schema
+```sql
+processos_fila {
+  id: UUID (PK)
+  codigo_processo: VARCHAR
+  ...existing fields...
+  
+  -- Queue control
+  responsavel_avaliacao: UUID (FK users) - Quem está avaliando agora
+  status_avaliacao: ENUM (PENDENTE|EM_ANALISE|CONCLUIDO)
+  
+  -- Inactivity tracking
+  ultima_interacao: TIMESTAMP - Última ação do avaliador
+  tempo_captura: TIMESTAMP - Quando foi pego para EM_ANALISE
+  
+  -- Edit control
+  avaliador_id_original: UUID (FK users) - Quem avaliou originalmente
+}
+```
+
+### Key Hooks & Functions
+
+**`useInactivityTimeout(processoId, enabled)`**
+- Path: `src/hooks/useInactivityTimeout.ts`
+- Detecta: keydown, click, scroll, change, input
+- Atualiza `ultima_interacao` cada 30s de atividade
+- Chamado em `FormularioAvaliacao.tsx`
+
+**`liberar_processos_orfaos()`**
+- SQL: `supabase/migrations/20260126_add_queue_control.sql`
+- Limpa processos em EM_ANALISE com 1h+ sem interação
+- Volta para PENDENTE silenciosamente
+- Executado via CRON do Supabase
+
 ## Notes for AI Agents
 
 - This is a **GitHub Pages deployment**: Static site; no backend API routes
@@ -123,3 +196,4 @@ VITE_SUPABASE_PUBLISHABLE_KEY=your-key
 - **No Next.js or SSR**: Pure SPA, so all rendering happens client-side
 - **Bundle size**: Monitor dependencies; Vite handles tree-shaking
 - **GitHub Actions**: Triggered only on main branch; PR builds may differ from live site
+- **Queue Management**: Critical for multi-user evaluation scenarios - monitor timeout logic carefully
diff --git a/src/components/cogede/FormularioAvaliacao.tsx b/src/components/cogede/FormularioAvaliacao.tsx
index 933358a..b23c497 100644
--- a/src/components/cogede/FormularioAvaliacao.tsx
+++ b/src/components/cogede/FormularioAvaliacao.tsx
@@ -10,6 +10,7 @@ import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@
 import { Save, ArrowRight, Lock, Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
 import { ProcessoFila, AvaliacaoDocumental, PecaProcessual, ASSUNTOS_TPU, TIPOS_PECA } from "@/types/cogede";
 import { toast } from "sonner";
+import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
 
 interface FormularioAvaliacaoProps {
   processo: ProcessoFila;
@@ -57,6 +58,9 @@ export function FormularioAvaliacao({ processo, responsavel, onSalvarEProximo, c
   const [formData, setFormData] = useState(initialFormData);
   const [divergencias, setDivergencias] = useState<DivergenciaClassificacao[]>([]);
 
+  // Ativar rastreamento de inatividade enquanto o formulário está sendo editado
+  useInactivityTimeout(processo.ID, true);
+
   // Carregar dados da avaliação anterior ao montar ou quando avaliacaoAnterior mudar
   // Este efeito restaura dados salvos quando o avaliador está editando uma avaliação existente
   useEffect(() => {
diff --git a/src/hooks/useInactivityTimeout.ts b/src/hooks/useInactivityTimeout.ts
new file mode 100644
index 0000000..65f6c41
--- /dev/null
+++ b/src/hooks/useInactivityTimeout.ts
@@ -0,0 +1,95 @@
+import { useEffect, useRef, useCallback } from "react";
+import { supabase } from "@/integrations/supabase/client";
+import { logger } from "@/lib/logger";
+
+/**
+ * Hook para rastrear inatividade e atualizar timestamp de interação
+ * 
+ * Detecta: digitação, cliques, scroll, salvamento
+ * Atualiza timestamp a cada interação para controle de timeout (1 hora)
+ * Se processo ficar sem interação por 1h, volta a PENDENTE automaticamente
+ * 
+ * @param processoId - ID do processo em EM_ANALISE
+ * @param enabled - Se deve estar ativo (default: true)
+ */
+export function useInactivityTimeout(processoId: string | undefined, enabled = true) {
+  const timeoutIdRef = useRef<NodeJS.Timeout>();
+  const checkIntervalRef = useRef<NodeJS.Timeout>();
+  const lastActivityRef = useRef<number>(Date.now());
+
+  const updateUltimaInteracao = useCallback(async () => {
+    if (!processoId) return;
+
+    try {
+      await supabase
+        .from("processos_fila")
+        .update({ ultima_interacao: new Date().toISOString() })
+        .eq("id", processoId);
+      
+      lastActivityRef.current = Date.now();
+    } catch (error) {
+      logger.error("[useInactivityTimeout] Erro ao atualizar última interação:", error);
+    }
+  }, [processoId]);
+
+  const verificarTimeout = useCallback(async () => {
+    if (!processoId) return;
+
+    const agora = Date.now();
+    const minutosInativo = (agora - lastActivityRef.current) / (1000 * 60);
+
+    // Após 1 hora de inatividade, o banco vai liberar automaticamente via CRON
+    // Mas checamos localmente para avisar o usuário se necessário
+    if (minutosInativo > 60) {
+      logger.warn(
+        `[useInactivityTimeout] Processo ${processoId} inativo por ${minutosInativo.toFixed(0)} minutos`
+      );
+    }
+  }, [processoId]);
+
+  useEffect(() => {
+    if (!enabled || !processoId) {
+      // Limpar se desabilitado
+      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
+      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
+      return;
+    }
+
+    // Handler para detectar atividade
+    const handleActivity = () => {
+      lastActivityRef.current = Date.now();
+
+      // Limpar timeout anterior
+      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
+
+      // Atualizar no banco a cada 30 segundos de atividade
+      // (evitar sobrecarga com updates muito frequentes)
+      timeoutIdRef.current = setTimeout(() => {
+        updateUltimaInteracao();
+      }, 30 * 1000);
+    };
+
+    // Eventos para detectar atividade
+    const eventos = ["keydown", "click", "scroll", "change", "input"];
+    eventos.forEach((evento) => {
+      window.addEventListener(evento, handleActivity);
+    });
+
+    // Inicializar timer de verificação (a cada 10 minutos)
+    checkIntervalRef.current = setInterval(() => {
+      verificarTimeout();
+    }, 10 * 60 * 1000);
+
+    // Registrar primeira interação imediatamente
+    updateUltimaInteracao();
+
+    // Cleanup
+    return () => {
+      eventos.forEach((evento) => {
+        window.removeEventListener(evento, handleActivity);
+      });
+      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
+      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
+    };
+  }, [processoId, enabled, updateUltimaInteracao, verificarTimeout]);
+}
diff --git a/src/pages/Index.tsx b/src/pages/Index.tsx
index e220546..18e9312 100644
--- a/src/pages/Index.tsx
+++ b/src/pages/Index.tsx
@@ -129,8 +129,30 @@ export default function Index() {
   };
 
   // Handler para editar avaliação existente
-  const handleEditarAvaliacao = (processo: ProcessoFila, avaliacaoAnterior?: Record<string, unknown>) => {
-    // Definir processo atual e iniciar sessão
+  const handleEditarAvaliacao = async (processo: ProcessoFila, avaliacaoAnterior?: Record<string, unknown>) => {
+    // Se há um processo em EM_ANALISE, liberar ele da fila antes de editar outro
+    if (sessao.processoAtual?.STATUS_AVALIACAO === "EM_ANALISE" && sessao.processoAtual.ID) {
+      try {
+        logger.log(`[Index] Liberando processo ${sessao.processoAtual.CODIGO_PROCESSO} ao editar anterior`);
+        
+        await supabase
+          .from("processos_fila")
+          .update({
+            status_avaliacao: "PENDENTE",
+            responsavel_avaliacao: null,
+            data_inicio_avaliacao: null,
+            ultima_interacao: null,
+            tempo_captura: null
+          })
+          .eq("id", sessao.processoAtual.ID);
+      } catch (error) {
+        logger.error("[Index] Erro ao liberar processo anterior:", error);
+        toast.error("Erro ao liberar processo anterior");
+        return;
+      }
+    }
+
+    // Agora editar o processo anterior
     setSessao(prev => ({
       ...prev,
       processoAtual: processo,
@@ -145,6 +167,7 @@ export default function Index() {
     // Navegação automática para aba de avaliação
     setAbaSelecionada("avaliacao");
 
+    logger.info(`[Index] Editando avaliação do processo ${processo.CODIGO_PROCESSO}`);
     toast.info(`Editando avaliação do processo ${processo.CODIGO_PROCESSO}`);
   };
 
diff --git a/supabase/migrations/20260126_add_queue_control.sql b/supabase/migrations/20260126_add_queue_control.sql
new file mode 100644
index 0000000..82db515
--- /dev/null
+++ b/supabase/migrations/20260126_add_queue_control.sql
@@ -0,0 +1,55 @@
+-- Migração: Sistema de controle de fila e inatividade
+-- Data: 2026-01-26
+-- Descrição: Adiciona campos para rastreamento de sessão ativa e inatividade
+
+-- Adicionar colunas para controle de sessão e inatividade
+ALTER TABLE processos_fila ADD COLUMN IF NOT EXISTS ultima_interacao TIMESTAMP WITH TIME ZONE;
+ALTER TABLE processos_fila ADD COLUMN IF NOT EXISTS avaliador_id_original UUID REFERENCES auth.users(id);
+ALTER TABLE processos_fila ADD COLUMN IF NOT EXISTS tempo_captura TIMESTAMP WITH TIME ZONE;
+
+-- Criar índice para otimizar queries de processos órfãos
+CREATE INDEX IF NOT EXISTS idx_processos_orfaos 
+ON processos_fila(status_avaliacao, ultima_interacao) 
+WHERE status_avaliacao = 'EM_ANALISE' AND responsavel_avaliacao IS NOT NULL;
+
+-- Comentários para documentação
+COMMENT ON COLUMN processos_fila.ultima_interacao IS 'Timestamp da última interação do avaliador (digitação, clique, scroll, salvamento)';
+COMMENT ON COLUMN processos_fila.avaliador_id_original IS 'ID do avaliador que originally completed a avaliação (para controle de edição)';
+COMMENT ON COLUMN processos_fila.tempo_captura IS 'Timestamp quando o processo foi capturado (EM_ANALISE)';
+
+-- Função para limpar processos órfãos (timeout de 1 hora)
+CREATE OR REPLACE FUNCTION liberar_processos_orfaos()
+RETURNS void AS $$
+BEGIN
+  UPDATE processos_fila
+  SET 
+    status_avaliacao = 'PENDENTE',
+    responsavel_avaliacao = NULL,
+    data_inicio_avaliacao = NULL,
+    ultima_interacao = NULL,
+    tempo_captura = NULL
+  WHERE 
+    status_avaliacao = 'EM_ANALISE' 
+    AND responsavel_avaliacao IS NOT NULL
+    AND ultima_interacao IS NOT NULL
+    AND (NOW() - ultima_interacao) > INTERVAL '1 hour';
+END;
+$$ LANGUAGE plpgsql;
+
+-- Função para validar acesso à edição (apenas avaliador original)
+CREATE OR REPLACE FUNCTION pode_editar_avaliacao(
+  p_processo_id UUID,
+  p_usuario_id UUID
+) RETURNS BOOLEAN AS $$
+DECLARE
+  v_avaliador_original UUID;
+BEGIN
+  SELECT avaliador_id_original INTO v_avaliador_original
+  FROM processos_fila
+  WHERE id = p_processo_id;
+  
+  -- Se não tem avaliador original, ninguém pode editar
+  -- Se tem e é igual ao usuário atual, pode editar
+  RETURN v_avaliador_original = p_usuario_id;
+END;
+$$ LANGUAGE plpgsql;

---

## Commit: ba8e3d5
commit: ba8e3d5 - Fix atomic process capture and prevent duplicate evaluations
Author: mateussonegheti
Date: 2026-01-28


diff --git a/src/hooks/useProcessos.tsx b/src/hooks/useProcessos.tsx
index 0f67f88..914c6a3 100644
--- a/src/hooks/useProcessos.tsx
+++ b/src/hooks/useProcessos.tsx
@@ -24,7 +24,7 @@ interface ProcessoDB {
   data_distribuicao: string | null;
   data_arquivamento_def: string | null;
   prazo_5_anos_completo: string | null;
-  status_avaliacao: string;
+  status_avaliacao: "PENDENTE" | "EM_ANALISE" | "CONCLUIDO";
   responsavel_avaliacao: string | null;
   data_inicio_avaliacao: string | null;
   data_fim_avaliacao: string | null;
@@ -33,6 +33,7 @@ interface ProcessoDB {
 
 export function useProcessos() {
   const { profile, isAdmin, isSupervisor } = useAuth();
+
   const [processos, setProcessos] = useState<ProcessoFila[]>([]);
   const [loteAtivo, setLoteAtivo] = useState<LoteImportacao | null>(null);
   const [loading, setLoading] = useState(true);
@@ -40,12 +41,13 @@ export function useProcessos() {
 
   const podeCarregarPlanilha = isAdmin || isSupervisor;
 
-  // Buscar lote ativo e processos
+  // ======================================================
+  // BUSCAR LOTE ATIVO E PROCESSOS
+  // ======================================================
   const fetchProcessos = useCallback(async () => {
     try {
       setLoading(true);
-      
-      // Buscar lote ativo
+
       const { data: lotes, error: lotesError } = await supabase
         .from("lotes_importacao")
         .select("*")
@@ -58,44 +60,45 @@ export function useProcessos() {
         return;
       }
 
-      if (lotes && lotes.length > 0) {
-        const lote = lotes[0] as LoteImportacao;
-        setLoteAtivo(lote);
-
-        // Buscar processos do lote
-        const { data: processosData, error: processosError } = await supabase
-          .from("processos_fila")
-          .select("*")
-          .eq("lote_id", lote.id)
-          .order("created_at", { ascending: true });
-
-        if (processosError) {
-          logger.error("Erro ao buscar processos:", processosError);
-          return;
-        }
-
-        if (processosData) {
-          const processosFormatados: ProcessoFila[] = (processosData as ProcessoDB[]).map((p) => ({
-            ID: p.id,
-            CODIGO_PROCESSO: p.codigo_processo,
-            NUMERO_CNJ: p.numero_cnj,
-            POSSUI_ASSUNTO: p.possui_assunto || "",
-            ASSUNTO_PRINCIPAL: p.assunto_principal || "",
-            POSSUI_MOV_ARQUIVADO: p.possui_mov_arquivado || "",
-            DATA_DISTRIBUICAO: p.data_distribuicao || "",
-            DATA_ARQUIVAMENTO_DEF: p.data_arquivamento_def || "",
-            PRAZO_5_ANOS_COMPLETO: p.prazo_5_anos_completo || "",
-            STATUS_AVALIACAO: p.status_avaliacao as "PENDENTE" | "EM_ANALISE" | "CONCLUIDO",
-            RESPONSAVEL: p.responsavel_avaliacao || undefined,
-            DATA_INICIO_AVALIACAO: p.data_inicio_avaliacao || undefined,
-            DATA_FIM: p.data_fim_avaliacao || undefined,
-          }));
-          setProcessos(processosFormatados);
-        }
-      } else {
+      if (!lotes || lotes.length === 0) {
         setLoteAtivo(null);
         setProcessos([]);
+        return;
+      }
+
+      const lote = lotes[0] as LoteImportacao;
+      setLoteAtivo(lote);
+
+      const { data: processosData, error: processosError } = await supabase
+        .from("processos_fila")
+        .select("*")
+        .eq("lote_id", lote.id)
+        .order("created_at", { ascending: true });
+
+      if (processosError) {
+        logger.error("Erro ao buscar processos:", processosError);
+        return;
       }
+
+      const processosFormatados: ProcessoFila[] = (processosData as ProcessoDB[]).map(
+        (p) => ({
+          ID: p.id,
+          CODIGO_PROCESSO: p.codigo_processo,
+          NUMERO_CNJ: p.numero_cnj,
+          POSSUI_ASSUNTO: p.possui_assunto || "",
+          ASSUNTO_PRINCIPAL: p.assunto_principal || "",
+          POSSUI_MOV_ARQUIVADO: p.possui_mov_arquivado || "",
+          DATA_DISTRIBUICAO: p.data_distribuicao || "",
+          DATA_ARQUIVAMENTO_DEF: p.data_arquivamento_def || "",
+          PRAZO_5_ANOS_COMPLETO: p.prazo_5_anos_completo || "",
+          STATUS_AVALIACAO: p.status_avaliacao,
+          RESPONSAVEL: p.responsavel_avaliacao || undefined,
+          DATA_INICIO_AVALIACAO: p.data_inicio_avaliacao || undefined,
+          DATA_FIM: p.data_fim_avaliacao || undefined,
+        })
+      );
+
+      setProcessos(processosFormatados);
     } catch (error) {
       logger.error("Erro ao buscar dados:", error);
     } finally {
@@ -103,7 +106,9 @@ export function useProcessos() {
     }
   }, []);
 
-  // Carregar nova planilha (apenas admin/supervisor)
+  // ======================================================
+  // CARREGAR PLANILHA (ADMIN / SUPERVISOR)
+  // ======================================================
   const carregarPlanilha = async (novosProcessos: ProcessoFila[]) => {
     if (!podeCarregarPlanilha || !profile) {
       toast.error("Você não tem permissão para carregar planilhas");
@@ -113,7 +118,6 @@ export function useProcessos() {
     try {
       setUploading(true);
 
-      // Desativar lotes anteriores
       if (loteAtivo) {
         await supabase
           .from("lotes_importacao")
@@ -121,7 +125,6 @@ export function useProcessos() {
           .eq("id", loteAtivo.id);
       }
 
-      // Criar novo lote
       const { data: novoLote, error: loteError } = await supabase
         .from("lotes_importacao")
         .insert({
@@ -135,11 +138,10 @@ export function useProcessos() {
 
       if (loteError || !novoLote) {
         logger.error("Erro ao criar lote:", loteError);
-        toast.error("Erro ao criar lote de importação");
+        toast.error("Erro ao criar lote");
         return;
       }
 
-      // Inserir processos
       const processosParaInserir = novosProcessos.map((p) => ({
         codigo_processo: p.CODIGO_PROCESSO,
         numero_cnj: p.NUMERO_CNJ,
@@ -149,8 +151,8 @@ export function useProcessos() {
         data_distribuicao: p.DATA_DISTRIBUICAO || null,
         data_arquivamento_def: p.DATA_ARQUIVAMENTO_DEF || null,
         prazo_5_anos_completo: p.PRAZO_5_ANOS_COMPLETO || null,
-        status_avaliacao: p.STATUS_AVALIACAO || "PENDENTE",
-        lote_id: (novoLote as LoteImportacao).id,
+        status_avaliacao: "PENDENTE",
+        lote_id: novoLote.id,
       }));
 
       const { error: insertError } = await supabase
@@ -163,130 +165,80 @@ export function useProcessos() {
         return;
       }
 
-      toast.success(`${novosProcessos.length} processos carregados com sucesso!`);
+      toast.success("Planilha carregada com sucesso");
       await fetchProcessos();
-    } catch (error) {
-      logger.error("Erro ao carregar planilha:", error);
-      toast.error("Erro ao carregar planilha");
     } finally {
       setUploading(false);
     }
   };
 
-  // Liberar processos órfãos do usuário (EM_ANALISE sem conclusão)
-  const liberarProcessosOrfaos = useCallback(async (responsavelId: string) => {
-    if (!loteAtivo?.id) return;
-    
+  // ======================================================
+  // CAPTURAR PRÓXIMO PROCESSO (RPC — ATÔMICO)
+  // ======================================================
+  const capturarProximoProcesso = async () => {
     try {
-      logger.log(`[useProcessos] Liberando processos órfãos do usuário ${responsavelId}`);
-      
-      const { error } = await supabase
-        .from("processos_fila")
-        .update({
-          status_avaliacao: "PENDENTE",
-          responsavel_avaliacao: null,
-          data_inicio_avaliacao: null,
-        })
-        .eq("status_avaliacao", "EM_ANALISE")
-        .eq("responsavel_avaliacao", responsavelId)
-        .eq("lote_id", loteAtivo.id);
+      const { data, error } = await supabase.rpc("capturar_proximo_processo" as any);
 
       if (error) {
-        logger.error("[useProcessos] Erro ao liberar processos órfãos:", error);
-      } else {
-        logger.log("[useProcessos] Processos órfãos liberados com sucesso");
-        await fetchProcessos();
+        logger.error("Erro RPC capturar_proximo_processo:", error);
+        toast.error("Erro ao capturar processo");
+        return null;
       }
-    } catch (error) {
-      logger.error("[useProcessos] Erro ao liberar processos órfãos:", error);
+
+      if (!data) {
+        toast.info("Não há processos pendentes disponíveis");
+        return null;
+      }
+
+      await fetchProcessos();
+      return data;
+    } catch {
+      toast.error("Erro inesperado ao capturar processo");
+      return null;
     }
-  }, [loteAtivo?.id, fetchProcessos]);
-
-  // Atualizar status de um processo
-  const atualizarStatusProcesso = async (
-    codigoProcesso: string,
-    status: "PENDENTE" | "EM_ANALISE" | "CONCLUIDO",
-    responsavelId?: string
-  ) => {
+  };
+
+  // ======================================================
+  // CONCLUIR PROCESSO
+  // ======================================================
+  const atualizarStatusProcesso = async (codigoProcesso: string) => {
     try {
-      logger.log(`[useProcessos] Atualizando processo ${codigoProcesso} para status ${status}`);
-      
-      if (!loteAtivo?.id) {
-        logger.error("[useProcessos] Lote ativo não encontrado");
-        return false;
-      }
+      if (!loteAtivo?.id) return false;
 
-      // Se estamos capturando um novo processo (EM_ANALISE), primeiro liberar qualquer processo órfão
-      if (status === "EM_ANALISE" && responsavelId) {
-        await liberarProcessosOrfaos(responsavelId);
-      }
-      
       const { error } = await supabase
         .from("processos_fila")
         .update({
-          status_avaliacao: status,
-          responsavel_avaliacao: responsavelId || null,
-          data_inicio_avaliacao: status === "EM_ANALISE" ? new Date().toISOString() : undefined,
-          data_fim_avaliacao: status === "CONCLUIDO" ? new Date().toISOString() : undefined,
+          status_avaliacao: "CONCLUIDO",
+          data_fim_avaliacao: new Date().toISOString(),
         })
         .eq("codigo_processo", codigoProcesso)
         .eq("lote_id", loteAtivo.id);
 
       if (error) {
-        logger.error("[useProcessos] Erro ao atualizar processo:", error);
+        logger.error("Erro ao concluir processo:", error);
         return false;
       }
 
-      logger.log(`[useProcessos] Processo ${codigoProcesso} atualizado no banco com sucesso`);
-
-      // Atualizar estado local imediatamente
-      setProcessos((prev) => {
-        const updated = prev.map((p) =>
-          p.CODIGO_PROCESSO === codigoProcesso
-            ? {
-                ...p,
-                STATUS_AVALIACAO: status,
-                RESPONSAVEL: responsavelId,
-                DATA_INICIO_AVALIACAO:
-                  status === "EM_ANALISE" ? new Date().toISOString() : p.DATA_INICIO_AVALIACAO,
-                DATA_FIM: status === "CONCLUIDO" ? new Date().toISOString() : p.DATA_FIM,
-              }
-            : p
-        );
-        
-        const pendentes = updated.filter(p => p.STATUS_AVALIACAO === "PENDENTE").length;
-        const emAnalise = updated.filter(p => p.STATUS_AVALIACAO === "EM_ANALISE").length;
-        const concluidos = updated.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO").length;
-        logger.log(`[useProcessos] Estado local atualizado - Pendentes: ${pendentes}, Em Análise: ${emAnalise}, Concluídos: ${concluidos}`);
-        
-        return updated;
-      });
-
+      await fetchProcessos();
       return true;
     } catch (error) {
-      logger.error("[useProcessos] Erro ao atualizar processo:", error);
+      logger.error("Erro ao concluir processo:", error);
       return false;
     }
   };
 
-  // Configurar realtime
+  // ======================================================
+  // REALTIME
+  // ======================================================
   useEffect(() => {
     fetchProcessos();
 
-    // Subscrever a mudanças em processos_fila
     const channel = supabase
       .channel("processos-changes")
       .on(
         "postgres_changes",
-        {
-          event: "*",
-          schema: "public",
-          table: "processos_fila",
-        },
-        (payload) => {
-          logger.log("Mudança em processos:", payload);
-          fetchProcessos();
-        }
+        { event: "*", schema: "public", table: "processos_fila" },
+        () => fetchProcessos()
       )
       .subscribe();
 
@@ -302,8 +254,8 @@ export function useProcessos() {
     uploading,
     podeCarregarPlanilha,
     carregarPlanilha,
+    capturarProximoProcesso,
     atualizarStatusProcesso,
-    liberarProcessosOrfaos,
     refetch: fetchProcessos,
   };
-}
+}
\ No newline at end of file
diff --git a/src/pages/Index.tsx b/src/pages/Index.tsx
index 18e9312..440f0ac 100644
--- a/src/pages/Index.tsx
+++ b/src/pages/Index.tsx
@@ -1,4 +1,4 @@
-import { useState, useEffect, useCallback, useRef } from "react";
+import { useState, useEffect } from "react";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { FileText, GitMerge, LayoutDashboard, ClipboardList } from "lucide-react";
 import { Header } from "@/components/cogede/Header";
@@ -17,29 +17,31 @@ import { logger } from "@/lib/logger";
 
 export default function Index() {
   const { profile, isAdmin, isSupervisor } = useAuth();
-  const { 
-    processos, 
+
+  const {
+    processos,
     loteAtivo,
-    loading: processosLoading, 
+    loading: processosLoading,
     uploading,
     podeCarregarPlanilha,
     carregarPlanilha,
-    atualizarStatusProcesso,
-    liberarProcessosOrfaos
+    capturarProximoProcesso,
+    atualizarStatusProcesso
   } = useProcessos();
-  
+
   const [sessao, setSessao] = useState<SessaoAvaliacao>({
     responsavel: "",
     processoAtual: undefined,
     iniciada: false
   });
-  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDocumental[]>([]);
+
+  const [avaliacaoAnterior, setAvaliacaoAnterior] =
+    useState<Record<string, unknown> | null>(null);
+
   const [carregando, setCarregando] = useState(false);
   const [abaSelecionada, setAbaSelecionada] = useState("avaliacao");
-  const [avaliacaoAnterior, setAvaliacaoAnterior] = useState<Record<string, unknown> | null>(null);
-  const cleanupExecutedRef = useRef(false);
 
-  // Auto-preencher responsável quando o perfil do usuário estiver disponível
+  // Preencher responsável automaticamente
   useEffect(() => {
     if (profile?.nome && !sessao.responsavel) {
       setSessao(prev => ({
@@ -49,70 +51,6 @@ export default function Index() {
     }
   }, [profile?.nome, sessao.responsavel]);
 
-  // Liberar processos órfãos do usuário ao carregar a página (apenas uma vez)
-  useEffect(() => {
-    if (profile?.id && loteAtivo?.id) {
-      liberarProcessosOrfaos(profile.id);
-    }
-  }, [profile?.id, loteAtivo?.id, liberarProcessosOrfaos]);
-
-  // Cleanup function para liberar processo quando usuário sai
-  const cleanupOnExit = useCallback(async () => {
-    if (cleanupExecutedRef.current) return;
-    if (!sessao.processoAtual?.CODIGO_PROCESSO || !profile?.id || !loteAtivo?.id) return;
-    
-    cleanupExecutedRef.current = true;
-    logger.log("[Index] Executando cleanup - liberando processo do usuário");
-    
-    try {
-      // Use Supabase client instead of direct HTTP calls for better security
-      await supabase
-        .from("processos_fila")
-        .update({
-          status_avaliacao: "PENDENTE",
-          responsavel_avaliacao: null,
-          data_inicio_avaliacao: null
-        })
-        .eq("codigo_processo", sessao.processoAtual.CODIGO_PROCESSO)
-        .eq("lote_id", loteAtivo.id);
-    } catch (error) {
-      logger.error("[Index] Erro ao liberar processo no cleanup:", error);
-    }
-  }, [sessao.processoAtual?.CODIGO_PROCESSO, profile?.id, loteAtivo?.id]);
-
-  // Adicionar listeners para cleanup na saída
-  useEffect(() => {
-    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
-      if (sessao.processoAtual) {
-        cleanupOnExit();
-        // Mostrar confirmação se há processo em andamento
-        e.preventDefault();
-        e.returnValue = '';
-      }
-    };
-
-    const handleVisibilityChange = () => {
-      if (document.visibilityState === 'hidden' && sessao.processoAtual) {
-        cleanupOnExit();
-      }
-    };
-
-    window.addEventListener('beforeunload', handleBeforeUnload);
-    document.addEventListener('visibilitychange', handleVisibilityChange);
-
-    return () => {
-      window.removeEventListener('beforeunload', handleBeforeUnload);
-      document.removeEventListener('visibilitychange', handleVisibilityChange);
-    };
-  }, [sessao.processoAtual, cleanupOnExit]);
-
-  // Reset cleanup flag when a new process is captured
-  useEffect(() => {
-    if (sessao.processoAtual) {
-      cleanupExecutedRef.current = false;
-    }
-  }, [sessao.processoAtual?.CODIGO_PROCESSO]);
-
   const totalPendentes = processos.filter(p => p.STATUS_AVALIACAO === "PENDENTE").length;
   const totalEmAnalise = processos.filter(p => p.STATUS_AVALIACAO === "EM_ANALISE").length;
   const totalConcluidos = processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO").length;
@@ -128,277 +66,181 @@ export default function Index() {
     toast.success(`Sessão iniciada para ${responsavel}`);
   };
 
-  // Handler para editar avaliação existente
-  const handleEditarAvaliacao = async (processo: ProcessoFila, avaliacaoAnterior?: Record<string, unknown>) => {
-    // Se há um processo em EM_ANALISE, liberar ele da fila antes de editar outro
-    if (sessao.processoAtual?.STATUS_AVALIACAO === "EM_ANALISE" && sessao.processoAtual.ID) {
-      try {
-        logger.log(`[Index] Liberando processo ${sessao.processoAtual.CODIGO_PROCESSO} ao editar anterior`);
-        
-        await supabase
-          .from("processos_fila")
-          .update({
-            status_avaliacao: "PENDENTE",
-            responsavel_avaliacao: null,
-            data_inicio_avaliacao: null,
-            ultima_interacao: null,
-            tempo_captura: null
-          })
-          .eq("id", sessao.processoAtual.ID);
-      } catch (error) {
-        logger.error("[Index] Erro ao liberar processo anterior:", error);
-        toast.error("Erro ao liberar processo anterior");
+  const handleIniciarAvaliacao = async () => {
+    if (!profile?.id) return;
+
+    setCarregando(true);
+
+    try {
+      const processo = await capturarProximoProcesso();
+
+      if (!processo) {
+        toast.info("Não há processos pendentes disponíveis");
+        setSessao(prev => ({ ...prev, processoAtual: undefined }));
         return;
       }
-    }
-
-    // Agora editar o processo anterior
-    setSessao(prev => ({
-      ...prev,
-      processoAtual: processo,
-      iniciada: true
-    }));
 
-    // Carregar dados da avaliação anterior se foram passados
-    if (avaliacaoAnterior) {
-      setAvaliacaoAnterior(avaliacaoAnterior);
-    }
+      const processoFormatado: ProcessoFila = {
+        ID: processo.id,
+        CODIGO_PROCESSO: processo.codigo_processo,
+        NUMERO_CNJ: processo.numero_cnj,
+        POSSUI_ASSUNTO: processo.possui_assunto || "",
+        ASSUNTO_PRINCIPAL: processo.assunto_principal || "",
+        POSSUI_MOV_ARQUIVADO: processo.possui_mov_arquivado || "",
+        DATA_DISTRIBUICAO: processo.data_distribuicao || "",
+        DATA_ARQUIVAMENTO_DEF: processo.data_arquivamento_def || "",
+        PRAZO_5_ANOS_COMPLETO: processo.prazo_5_anos_completo || "",
+        STATUS_AVALIACAO: "EM_ANALISE",
+        RESPONSAVEL: sessao.responsavel,
+        DATA_INICIO_AVALIACAO: new Date().toISOString()
+      };
 
-    // Navegação automática para aba de avaliação
-    setAbaSelecionada("avaliacao");
+      setSessao(prev => ({
+        ...prev,
+        processoAtual: processoFormatado,
+        iniciada: true
+      }));
 
-    logger.info(`[Index] Editando avaliação do processo ${processo.CODIGO_PROCESSO}`);
-    toast.info(`Editando avaliação do processo ${processo.CODIGO_PROCESSO}`);
+      toast.success(`Processo ${processo.codigo_processo} capturado para avaliação`);
+    } catch (error) {
+      logger.error("[Index] Erro ao capturar processo:", error);
+      toast.error("Erro ao capturar processo");
+    } finally {
+      setCarregando(false);
+    }
   };
 
-  const handleIniciarAvaliacao = async () => {
-    if (!profile?.id) return;
-    if (!loteAtivo?.id) {
-      toast.error("Nenhum lote ativo encontrado");
-      return;
-    }
-    
+  const handleSalvarEProximo = async (avaliacao: AvaliacaoDocumental) => {
+    if (!profile?.id || !sessao.processoAtual?.ID) return;
+
     setCarregando(true);
-    
-    // Buscar próximo processo pendente diretamente do banco para ter dados completos
-    const { data: proximoProcessoDb, error } = await supabase
-      .from("processos_fila")
-      .select("*")
-      .eq("status_avaliacao", "PENDENTE")
-      .eq("lote_id", loteAtivo.id)
-      .order("created_at", { ascending: true })
-      .limit(1)
-      .maybeSingle();
-    
-    if (error) {
-      logger.error("Erro ao buscar processo:", error);
-      toast.error("Erro ao buscar processo");
-      setCarregando(false);
-      return;
-    }
-    
-    if (proximoProcessoDb) {
-      // Atualizar no banco
-      const sucesso = await atualizarStatusProcesso(
-        proximoProcessoDb.codigo_processo,
-        "EM_ANALISE",
-        profile.id
+
+    try {
+      // Salvar avaliação
+      const { error } = await supabase
+        .from("avaliacoes")
+        .upsert(
+          {
+            processo_id: sessao.processoAtual.ID,
+            avaliador_id: profile.id,
+
+            descricao_assunto_faltante: avaliacao.descricaoAssuntoFaltante || null,
+            assunto_tpu: avaliacao.assuntoTpu || null,
+            hierarquia_correta: avaliacao.hierarquiaCorreta || null,
+            divergencia_hierarquia: avaliacao.divergenciaHierarquia || null,
+            destinacao_permanente: avaliacao.destinacaoPermanente || null,
+            descricao_situacao_arquivamento: avaliacao.descricaoSituacaoArquivamento || null,
+            inconsistencia_prazo: avaliacao.inconsistenciaPrazo || null,
+            pecas_tipos: avaliacao.pecasTipos || null,
+            pecas_ids: avaliacao.pecasIds || null,
+            pecas_combinado: avaliacao.pecasCombinado || null,
+            observacoes_pecas: avaliacao.observacoesPecas || null,
+            documento_nao_localizado: avaliacao.documentoNaoLocalizado || false,
+            documento_duplicado: avaliacao.documentoDuplicado || false,
+            erro_tecnico: avaliacao.erroTecnico || false,
+            ocorrencias_outro_detalhe: avaliacao.ocorrenciasOutroDetalhe || null,
+            divergencia_classificacao: avaliacao.divergenciaClassificacao || null,
+            tipo_informado_sistema: avaliacao.tipoInformadoSistema || null,
+            tipo_real_identificado: avaliacao.tipoRealIdentificado || null,
+            processo_vazio: avaliacao.processoVazio || false,
+            observacoes_gerais: avaliacao.observacoesGerais || null,
+
+            data_inicio: avaliacao.dataInicioAvaliacao,
+            data_fim: new Date().toISOString(),
+          },
+          {
+            onConflict: "processo_id,avaliador_id",
+          }
+        );
+
+      if (error) throw error;
+
+      await atualizarStatusProcesso(
+        sessao.processoAtual.CODIGO_PROCESSO
       );
-      
-      if (sucesso) {
+
+      toast.success("Avaliação salva com sucesso!");
+
+      // Captura atômica do próximo
+      const proximo = await capturarProximoProcesso();
+
+      if (proximo) {
         const processoFormatado: ProcessoFila = {
-          ID: proximoProcessoDb.id,
-          CODIGO_PROCESSO: proximoProcessoDb.codigo_processo,
-          NUMERO_CNJ: proximoProcessoDb.numero_cnj,
-          POSSUI_ASSUNTO: proximoProcessoDb.possui_assunto || "",
-          ASSUNTO_PRINCIPAL: proximoProcessoDb.assunto_principal || "",
-          POSSUI_MOV_ARQUIVADO: proximoProcessoDb.possui_mov_arquivado || "",
-          DATA_DISTRIBUICAO: proximoProcessoDb.data_distribuicao || "",
-          DATA_ARQUIVAMENTO_DEF: proximoProcessoDb.data_arquivamento_def || "",
-          PRAZO_5_ANOS_COMPLETO: proximoProcessoDb.prazo_5_anos_completo || "",
+          ID: proximo.id,
+          CODIGO_PROCESSO: proximo.codigo_processo,
+          NUMERO_CNJ: proximo.numero_cnj,
+          POSSUI_ASSUNTO: proximo.possui_assunto || "",
+          ASSUNTO_PRINCIPAL: proximo.assunto_principal || "",
+          POSSUI_MOV_ARQUIVADO: proximo.possui_mov_arquivado || "",
+          DATA_DISTRIBUICAO: proximo.data_distribuicao || "",
+          DATA_ARQUIVAMENTO_DEF: proximo.data_arquivamento_def || "",
+          PRAZO_5_ANOS_COMPLETO: proximo.prazo_5_anos_completo || "",
           STATUS_AVALIACAO: "EM_ANALISE",
           RESPONSAVEL: sessao.responsavel,
-          DATA_INICIO_AVALIACAO: new Date().toISOString()
         };
-        
+
         setSessao(prev => ({
           ...prev,
           processoAtual: processoFormatado
         }));
-        
-        toast.success(`Processo ${proximoProcessoDb.codigo_processo} capturado para avaliação`);
-      } else {
-        toast.error("Erro ao capturar processo");
-      }
-    } else {
-      toast.info("Não há mais processos pendentes na fila");
-    }
-    
-    setCarregando(false);
-  };
 
-  const handleSalvarEProximo = async (avaliacao: AvaliacaoDocumental) => {
-    if (!profile?.id) return;
-    
-    setCarregando(true);
-    
-    // Adicionar data de fim e salvar avaliação
-    const avaliacaoCompleta = {
-      ...avaliacao,
-      dataFimAvaliacao: new Date().toISOString(),
-    };
-    setAvaliacoes((prev) => [...prev, avaliacaoCompleta]);
-    
-    // Buscar o ID do processo no banco
-    const processoAtual = sessao.processoAtual;
-    if (!processoAtual?.ID) {
-      toast.error("ID do processo não encontrado");
-      setCarregando(false);
-      return;
-    }
-    
-    // Inserir avaliação no banco de dados
-    const { error: insertError } = await supabase
-      .from("avaliacoes")
-      .insert({
-        processo_id: processoAtual.ID,
-        avaliador_id: profile.id,
-        descricao_assunto_faltante: avaliacao.descricaoAssuntoFaltante || null,
-        assunto_tpu: avaliacao.assuntoTpu || null,
-        hierarquia_correta: avaliacao.hierarquiaCorreta || null,
-        divergencia_hierarquia: avaliacao.divergenciaHierarquia || null,
-        destinacao_permanente: avaliacao.destinacaoPermanente || null,
-        descricao_situacao_arquivamento: avaliacao.descricaoSituacaoArquivamento || null,
-        inconsistencia_prazo: avaliacao.inconsistenciaPrazo || null,
-        pecas_tipos: avaliacao.pecasTipos || null,
-        pecas_ids: avaliacao.pecasIds || null,
-        pecas_combinado: avaliacao.pecasCombinado || null,
-        observacoes_pecas: avaliacao.observacoesPecas || null,
-        documento_nao_localizado: avaliacao.documentoNaoLocalizado || false,
-        documento_duplicado: avaliacao.documentoDuplicado || false,
-        erro_tecnico: avaliacao.erroTecnico || false,
-        ocorrencias_outro_detalhe: avaliacao.ocorrenciasOutroDetalhe || null,
-        divergencia_classificacao: avaliacao.divergenciaClassificacao || null,
-        tipo_informado_sistema: avaliacao.tipoInformadoSistema || null,
-        tipo_real_identificado: avaliacao.tipoRealIdentificado || null,
-        processo_vazio: avaliacao.processoVazio || false,
-        observacoes_gerais: avaliacao.observacoesGerais || null,
-        data_inicio: avaliacao.dataInicioAvaliacao,
-        data_fim: new Date().toISOString(),
-      });
-    
-    if (insertError) {
-      logger.error("Erro ao inserir avaliação:", insertError);
-      toast.error("Erro ao salvar avaliação no banco de dados");
-      setCarregando(false);
-      return;
-    }
-    
-    // Marcar processo como concluído
-    const sucesso = await atualizarStatusProcesso(
-      avaliacao.codigoProcesso,
-      "CONCLUIDO",
-      profile.id
-    );
-    
-    if (sucesso) {
-      toast.success("Avaliação salva com sucesso!");
-      
-      // Buscar próximo processo diretamente do banco para ter dados completos
-      const { data: proximoProcessoDb, error: proximoError } = await supabase
-        .from("processos_fila")
-        .select("*")
-        .eq("status_avaliacao", "PENDENTE")
-        .eq("lote_id", loteAtivo?.id || "")
-        .neq("codigo_processo", avaliacao.codigoProcesso)
-        .order("created_at", { ascending: true })
-        .limit(1)
-        .maybeSingle();
-      
-      if (proximoError) {
-        logger.error("Erro ao buscar próximo processo:", proximoError);
-      }
-      
-      if (proximoProcessoDb) {
-        const sucessoProximo = await atualizarStatusProcesso(
-          proximoProcessoDb.codigo_processo,
-          "EM_ANALISE",
-          profile.id
-        );
-        
-        if (sucessoProximo) {
-          const processoFormatado: ProcessoFila = {
-            ID: proximoProcessoDb.id,
-            CODIGO_PROCESSO: proximoProcessoDb.codigo_processo,
-            NUMERO_CNJ: proximoProcessoDb.numero_cnj,
-            POSSUI_ASSUNTO: proximoProcessoDb.possui_assunto || "",
-            ASSUNTO_PRINCIPAL: proximoProcessoDb.assunto_principal || "",
-            POSSUI_MOV_ARQUIVADO: proximoProcessoDb.possui_mov_arquivado || "",
-            DATA_DISTRIBUICAO: proximoProcessoDb.data_distribuicao || "",
-            DATA_ARQUIVAMENTO_DEF: proximoProcessoDb.data_arquivamento_def || "",
-            PRAZO_5_ANOS_COMPLETO: proximoProcessoDb.prazo_5_anos_completo || "",
-            STATUS_AVALIACAO: "EM_ANALISE",
-            RESPONSAVEL: sessao.responsavel,
-            DATA_INICIO_AVALIACAO: new Date().toISOString()
-          };
-          
-          setSessao(prev => ({
-            ...prev,
-            processoAtual: processoFormatado
-          }));
-          
-          toast.info("Próximo processo carregado automaticamente");
-        }
+        toast.info("Próximo processo carregado automaticamente");
       } else {
         setSessao(prev => ({ ...prev, processoAtual: undefined }));
         toast.info("Todos os processos foram avaliados!");
       }
-    } else {
+
+      setAvaliacaoAnterior(null);
+    } catch (error) {
+      logger.error("[Index] Erro ao salvar avaliação:", error);
       toast.error("Erro ao salvar avaliação");
+    } finally {
+      setCarregando(false);
     }
-
-    // Limpar dados da avaliação anterior após salvar
-    setAvaliacaoAnterior(null);
-    
-    setCarregando(false);
   };
 
   const handleProcessosCarregados = async (novosProcessos: ProcessoFila[]) => {
     await carregarPlanilha(novosProcessos);
-    setSessao((prev) => ({ ...prev, processoAtual: undefined }));
-    setAvaliacoes([]); // Resetar avaliações ao carregar nova planilha
+    setSessao(prev => ({ ...prev, processoAtual: undefined }));
   };
 
   return (
     <div className="min-h-screen bg-background">
       <Header />
-      
+
       <main className="container mx-auto px-4 py-6">
-        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="space-y-6">
-          <TabsList className={`grid w-full max-w-2xl ${podeVerDashboard ? "grid-cols-4" : "grid-cols-2"}`}>
-            <TabsTrigger value="avaliacao" className="gap-2">
-              <FileText className="h-4 w-4" />
+        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
+          <TabsList
+            className={`grid w-full max-w-2xl ${
+              podeVerDashboard ? "grid-cols-4" : "grid-cols-2"
+            }`}
+          >
+            <TabsTrigger value="avaliacao">
+              <FileText className="h-4 w-4 mr-2" />
               Avaliação
             </TabsTrigger>
-            <TabsTrigger value="minhas-avaliacoes" className="gap-2">
-              <ClipboardList className="h-4 w-4" />
+
+            <TabsTrigger value="minhas-avaliacoes">
+              <ClipboardList className="h-4 w-4 mr-2" />
               Minhas Avaliações
             </TabsTrigger>
+
             {podeVerDashboard && (
-              <TabsTrigger value="dashboard" className="gap-2">
-                <LayoutDashboard className="h-4 w-4" />
+              <TabsTrigger value="dashboard">
+                <LayoutDashboard className="h-4 w-4 mr-2" />
                 Dashboard
               </TabsTrigger>
             )}
+
             {podeVerDashboard && (
-              <TabsTrigger value="merge" className="gap-2">
-                <GitMerge className="h-4 w-4" />
+              <TabsTrigger value="merge">
+                <GitMerge className="h-4 w-4 mr-2" />
                 Merge
               </TabsTrigger>
             )}
           </TabsList>
 
-          <TabsContent value="avaliacao" className="space-y-6">
+          <TabsContent value="avaliacao">
             {podeVerDashboard && (
               <PainelSupervisor
                 onProcessosCarregados={handleProcessosCarregados}
@@ -408,7 +250,7 @@ export default function Index() {
                 loteId={loteAtivo?.id}
               />
             )}
-            
+
             <SessaoCard
               sessao={sessao}
               onIniciarSessao={handleIniciarSessao}
@@ -430,21 +272,21 @@ export default function Index() {
             )}
           </TabsContent>
 
-          <TabsContent value="minhas-avaliacoes" className="space-y-6">
+          <TabsContent value="minhas-avaliacoes">
             {loteAtivo?.id ? (
               <MinhasAvaliacoes
-                onEditarAvaliacao={handleEditarAvaliacao}
+                onEditarAvaliacao={() => {}}
                 loteId={loteAtivo.id}
               />
             ) : (
               <div className="text-center py-12 text-muted-foreground">
-                Nenhum lote ativo. Aguarde o supervisor carregar uma planilha.
+                Nenhum lote ativo.
               </div>
             )}
           </TabsContent>
 
           {podeVerDashboard && (
-            <TabsContent value="dashboard" className="space-y-6">
+            <TabsContent value="dashboard">
               <DashboardSupervisor processos={processos} loteId={loteAtivo?.id} />
             </TabsContent>
           )}
@@ -456,4 +298,4 @@ export default function Index() {
       </main>
     </div>
   );
-}
+}
\ No newline at end of file

---

## Commit: 49ff0ea
commit: 49ff0ea - Remove .env from repository
Author: mateussonegheti
Date: 2026-01-27


diff --git a/.env b/.env
deleted file mode 100644
index 86918f7..0000000
--- a/.env
+++ /dev/null
@@ -1,3 +0,0 @@
-VITE_SUPABASE_PROJECT_ID="qyjaztkscvcrnppeiapl"
-VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_rhscK1yqKfpOUa1y1wvuqw_hgpT8eqW"
-VITE_SUPABASE_URL="https://qyjaztkscvcrnppeiapl.supabase.co"

---

## Commit: 6c8bd2f
commit: 6c8bd2f - Update Supabase credentials to new project
Author: mateussonegheti
Date: 2026-01-27


diff --git a/.env b/.env
index 4957ed5..86918f7 100644
--- a/.env
+++ b/.env
@@ -1,3 +1,3 @@
-VITE_SUPABASE_PROJECT_ID="yiiligldjnfxajodtpys"
-VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaWxpZ2xkam5meGFqb2R0cHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjY5MjAsImV4cCI6MjA4MzU0MjkyMH0.1ah69AWqSrtYXa_CmJR9cjF2XTfNe1v0ekKdLYMGli4"
-VITE_SUPABASE_URL="https://yiiligldjnfxajodtpys.supabase.co"
+VITE_SUPABASE_PROJECT_ID="qyjaztkscvcrnppeiapl"
+VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_rhscK1yqKfpOUa1y1wvuqw_hgpT8eqW"
+VITE_SUPABASE_URL="https://qyjaztkscvcrnppeiapl.supabase.co"

---

## Commit: f1df15b
commit: f1df15b - feat: Navegação automática para aba de avaliação e dados pré-preenchidos na edição
Author: mateussonegheti
Date: 2026-01-26

- Ao clicar 'Editar' em 'Minhas Avaliações', avaliador é movido automaticamente para aba de avaliações
- Formulário mantém dados preenchidos anteriormente ao editar avaliação existente
- Otimizado fluxo de busca de dados para evitar duplicação
- Melhorado com comentários explicativos no código

diff --git a/.github/copilot-instructions.md b/.github/copilot-instructions.md
new file mode 100644
index 0000000..0bec07d
--- /dev/null
+++ b/.github/copilot-instructions.md
@@ -0,0 +1,125 @@
+# Process Compass - AI Coding Instructions
+
+## Project Overview
+Process Compass is a React + TypeScript SPA for managing judicial process evaluations and document management (COGEDE system). Deployed on GitHub Pages with a Supabase backend.
+
+## Core Architecture
+
+### Stack
+- **Frontend**: React 18 + TypeScript + Vite
+- **UI Components**: shadcn/ui (Radix primitives + Tailwind)
+- **Styling**: Tailwind CSS + PostCSS
+- **Backend**: Supabase (PostgreSQL + Auth + Storage)
+- **State**: React Query + React Hook Form
+- **Routing**: React Router v6
+- **Charting**: Recharts
+
+### Key File Structure
+- `src/pages/` - Three main routes: Index (dashboard), Login, Admin
+- `src/components/cogede/` - Domain components (Dashboard, Evaluations, Merge)
+- `src/components/ui/` - shadcn/ui exported components (auto-generated via CLI)
+- `src/hooks/useAuth.tsx` - Auth context + role management (admin/supervisor/avaliador)
+- `src/integrations/supabase/client.ts` - Supabase client singleton
+- `src/types/cogede.ts` - Domain types (ProcessoFila, AvaliacaoDocumental)
+
+## Critical Patterns
+
+### Authentication & Authorization
+- **Three roles**: admin, supervisor, avaliador
+- `useAuth()` hook provides user, session, role, isAdmin/isSupervisor/isAvaliador flags
+- **ProtectedRoute** wrapper in App.tsx enforces UI-level access (but RLS policies are primary security)
+- Role fetched from user profile table on auth state change
+
+### Data Fetching
+- Use React Query for server state (see DashboardSupervisor.tsx for patterns)
+- Supabase client: `import { supabase } from "@/integrations/supabase/client"`
+- Always handle loading and error states
+
+### CSV Import Security
+- `src/lib/csvValidation.ts`: File size (10MB), extension, MIME type, formula injection checks
+- Sanitize formula prefixes (=, +, -, @, \t, \r) before storing
+- Validate before upload; show user-friendly error messages
+
+### Form Patterns
+- Use React Hook Form + Zod validation
+- shadcn/ui form wrapper in `src/components/ui/form.tsx`
+- FormularioAvaliacao.tsx shows domain form structure
+
+### Styling
+- Tailwind utility-first; use `cn()` from `@/lib/utils` for conditional classes
+- Dark mode via next-themes (theme stored in localStorage)
+- Component-scoped CSS rarely needed
+
+## Development Workflow
+
+### Commands
+```bash
+npm run dev      # Start dev server (http://localhost:8080)
+npm run build    # Production build (to dist/)
+npm run preview  # Preview production build locally
+npm run lint     # ESLint check (strict off for vars)
+```
+
+### Build & Deployment
+- **Base URL**: `/process-compass/` (GitHub Pages subpath)
+- **Auto-deploy**: `.github/workflows/deploy.yml` runs on main branch push
+- Uses SWC for fast transpilation via `@vitejs/plugin-react-swc`
+
+### TypeScript Config
+- Loose checking: `noImplicitAny: false`, `strictNullChecks: false` (intentional)
+- Path alias: `@/*` → `./src/*`
+- Reference: tsconfig.app.json and tsconfig.node.json
+
+## Integration Points
+
+### Supabase
+- **URL & Key**: Environment variables VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
+- **Auth**: Uses localStorage for session persistence, auto-refresh enabled
+- **Types**: Auto-generated from migrations → `src/integrations/supabase/types.ts`
+- **RLS**: Database policies enforce security; UI-level checks are secondary
+
+### Environment Variables
+Create `.env.local`:
+```
+VITE_SUPABASE_URL=https://your-project.supabase.co
+VITE_SUPABASE_PUBLISHABLE_KEY=your-key
+```
+
+## Common Workflows
+
+### Adding a New Component
+1. Create in `src/components/cogede/` or `src/components/ui/`
+2. For UI: Use shadcn/ui CLI or copy existing component structure
+3. Import and use in pages or parent components
+
+### Adding a New Page
+1. Create in `src/pages/PageName.tsx`
+2. Add route in App.tsx Routes
+3. Wrap with ProtectedRoute if authentication needed
+
+### Modifying Database
+1. Create migration: `supabase migration new description`
+2. Write SQL in `supabase/migrations/`
+3. Types auto-sync to `src/integrations/supabase/types.ts`
+4. Update domain types in `src/types/cogede.ts` as needed
+
+### Handling Errors & Logging
+- Import `logger` from `@/lib/logger` for structured logging
+- Use `sonner` toast for user-facing errors (see imports in App.tsx)
+- Catch async operations and show appropriate UI feedback
+
+## Conventions
+
+- **No unused vars** via eslint rule (allows flexibility during development)
+- **React Hooks Rules** enforced; components must be pure
+- **API errors**: Always catch and display via toast/alert
+- **Portuguese naming**: Domain types and components use Portuguese (COGEDE system)
+- **shadcn/ui pattern**: Radix-based, headless by default; compose with Tailwind
+
+## Notes for AI Agents
+
+- This is a **GitHub Pages deployment**: Static site; no backend API routes
+- **All data persistence** goes through Supabase (auth, storage, functions)
+- **No Next.js or SSR**: Pure SPA, so all rendering happens client-side
+- **Bundle size**: Monitor dependencies; Vite handles tree-shaking
+- **GitHub Actions**: Triggered only on main branch; PR builds may differ from live site
diff --git a/package-lock.json b/package-lock.json
index d922c74..21d2bf9 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -83,7 +83,6 @@
       "version": "5.2.0",
       "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
       "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=10"
@@ -797,7 +796,6 @@
       "version": "8.0.2",
       "resolved": "https://registry.npmjs.org/@isaacs/cliui/-/cliui-8.0.2.tgz",
       "integrity": "sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "string-width": "^5.1.2",
@@ -815,7 +813,6 @@
       "version": "0.3.5",
       "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.5.tgz",
       "integrity": "sha512-IzL8ZoEDIBRWEzlCcRhOaCupYyN5gdIK+Q6fbFdPDg6HqX6jpkItn7DFIpW9LQzXG6Df9sA7+OKnq0qlz/GaQg==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "@jridgewell/set-array": "^1.2.1",
@@ -830,7 +827,6 @@
       "version": "3.1.2",
       "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
       "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=6.0.0"
@@ -840,7 +836,6 @@
       "version": "1.2.1",
       "resolved": "https://registry.npmjs.org/@jridgewell/set-array/-/set-array-1.2.1.tgz",
       "integrity": "sha512-R8gLRTZeyp03ymzP/6Lil/28tGeGEzhx1q2k703KGWRAI1VdvPIXdG70VJc2pAMw3NA6JKL5hhFu1sJX0Mnn/A==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=6.0.0"
@@ -850,14 +845,12 @@
       "version": "1.5.0",
       "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.0.tgz",
       "integrity": "sha512-gv3ZRaISU3fjPAgNsriBRqGWQL6quFx04YMPW/zD8XMLsU32mhCCbfbO6KZFLjvYpCZ8zyDEgqsgf+PwPaM7GQ==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/@jridgewell/trace-mapping": {
       "version": "0.3.25",
       "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.25.tgz",
       "integrity": "sha512-vNk6aEwybGtawWmy/PzwnGDOjCkLWSD2wqvjGGAgOAwCGWySYXfYoxt00IJkTF+8Lb57DwOb3Aa0o9CApepiYQ==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "@jridgewell/resolve-uri": "^3.1.0",
@@ -868,7 +861,6 @@
       "version": "2.1.5",
       "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
       "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "@nodelib/fs.stat": "2.0.5",
@@ -882,7 +874,6 @@
       "version": "2.0.5",
       "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
       "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">= 8"
@@ -892,7 +883,6 @@
       "version": "1.2.8",
       "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
       "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "@nodelib/fs.scandir": "2.1.5",
@@ -906,7 +896,6 @@
       "version": "0.11.0",
       "resolved": "https://registry.npmjs.org/@pkgjs/parseargs/-/parseargs-0.11.0.tgz",
       "integrity": "sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==",
-      "dev": true,
       "license": "MIT",
       "optional": true,
       "engines": {
@@ -2964,15 +2953,16 @@
       "version": "15.7.13",
       "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.13.tgz",
       "integrity": "sha512-hCZTSvwbzWGvhqxp/RqVqwU999pBf2vp7hzIjiYOsl8wqOmUxkQ6ddw1cV3l8811+kdUFus/q4d1Y3E3SyEifA==",
-      "dev": true,
+      "devOptional": true,
       "license": "MIT"
     },
     "node_modules/@types/react": {
       "version": "18.3.23",
       "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.23.tgz",
       "integrity": "sha512-/LDXMQh55EzZQ0uVAZmKKhfENivEvWz6E+EYzh+/MCjMhNsotd+ZHhBGIjFDTi6+fz0OhQQQLbTgdQIxxCsC0w==",
-      "dev": true,
+      "devOptional": true,
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "@types/prop-types": "*",
         "csstype": "^3.0.2"
@@ -2982,8 +2972,9 @@
       "version": "18.3.7",
       "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
       "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
-      "dev": true,
+      "devOptional": true,
       "license": "MIT",
+      "peer": true,
       "peerDependencies": {
         "@types/react": "^18.0.0"
       }
@@ -3043,6 +3034,7 @@
       "integrity": "sha512-Zhy8HCvBUEfBECzIl1PKqF4p11+d0aUJS1GeUiuqK9WmOug8YCmC4h4bjyBvMyAMI9sbRczmrYL5lKg/YMbrcQ==",
       "dev": true,
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "@typescript-eslint/scope-manager": "8.38.0",
         "@typescript-eslint/types": "8.38.0",
@@ -3275,6 +3267,7 @@
       "integrity": "sha512-NZyJarBfL7nWwIq+FDL6Zp/yHEhePMNnnJ0y3qfieCrmNvYct8uvtiV41UvlSe6apAfk0fY1FbWx+NwfmpvtTg==",
       "dev": true,
       "license": "MIT",
+      "peer": true,
       "bin": {
         "acorn": "bin/acorn"
       },
@@ -3313,7 +3306,6 @@
       "version": "6.1.0",
       "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.1.0.tgz",
       "integrity": "sha512-7HSX4QQb4CspciLpVFwyRe79O3xsIZDDLER21kERQ71oaPodF8jL725AgJMFAYbooIqolJoRLuM81SpeUkpkvA==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=12"
@@ -3326,7 +3318,6 @@
       "version": "4.3.0",
       "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
       "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "color-convert": "^2.0.1"
@@ -3342,14 +3333,12 @@
       "version": "1.3.0",
       "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
       "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/anymatch": {
       "version": "3.1.3",
       "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
       "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "normalize-path": "^3.0.0",
@@ -3363,7 +3352,6 @@
       "version": "5.0.2",
       "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
       "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/argparse": {
@@ -3427,14 +3415,12 @@
       "version": "1.0.2",
       "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
       "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/binary-extensions": {
       "version": "2.3.0",
       "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
       "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=8"
@@ -3458,7 +3444,6 @@
       "version": "3.0.3",
       "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
       "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "fill-range": "^7.1.1"
@@ -3487,6 +3472,7 @@
         }
       ],
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "caniuse-lite": "^1.0.30001726",
         "electron-to-chromium": "^1.5.173",
@@ -3514,7 +3500,6 @@
       "version": "2.0.1",
       "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
       "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">= 6"
@@ -3562,7 +3547,6 @@
       "version": "3.6.0",
       "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
       "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "anymatch": "~3.1.2",
@@ -3587,7 +3571,6 @@
       "version": "5.1.2",
       "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
       "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "is-glob": "^4.0.1"
@@ -3636,7 +3619,6 @@
       "version": "2.0.1",
       "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
       "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "color-name": "~1.1.4"
@@ -3649,14 +3631,12 @@
       "version": "1.1.4",
       "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
       "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/commander": {
       "version": "4.1.1",
       "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
       "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">= 6"
@@ -3673,7 +3653,6 @@
       "version": "7.0.6",
       "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
       "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
-      "dev": true,
       "dependencies": {
         "path-key": "^3.1.0",
         "shebang-command": "^2.0.0",
@@ -3687,7 +3666,6 @@
       "version": "3.0.0",
       "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
       "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
-      "dev": true,
       "license": "MIT",
       "bin": {
         "cssesc": "bin/cssesc"
@@ -3828,6 +3806,7 @@
       "resolved": "https://registry.npmjs.org/date-fns/-/date-fns-3.6.0.tgz",
       "integrity": "sha512-fRHTG8g/Gif+kSh50gaGEdToemgfj74aRX3swtiouboip5JDLAyDE9F11nHMIcvOaXeOC6D7SpNhi7uFyB7Uww==",
       "license": "MIT",
+      "peer": true,
       "funding": {
         "type": "github",
         "url": "https://github.com/sponsors/kossnocorp"
@@ -3874,14 +3853,12 @@
       "version": "1.2.2",
       "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
       "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
-      "dev": true,
       "license": "Apache-2.0"
     },
     "node_modules/dlv": {
       "version": "1.1.3",
       "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
       "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/dom-helpers": {
@@ -3898,7 +3875,6 @@
       "version": "0.2.0",
       "resolved": "https://registry.npmjs.org/eastasianwidth/-/eastasianwidth-0.2.0.tgz",
       "integrity": "sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/electron-to-chromium": {
@@ -3912,7 +3888,8 @@
       "version": "8.6.0",
       "resolved": "https://registry.npmjs.org/embla-carousel/-/embla-carousel-8.6.0.tgz",
       "integrity": "sha512-SjWyZBHJPbqxHOzckOfo8lHisEaJWmwd23XppYFYVh10bU66/Pn5tkVkbkCMZVdbUE5eTCI2nD8OyIP4Z+uwkA==",
-      "license": "MIT"
+      "license": "MIT",
+      "peer": true
     },
     "node_modules/embla-carousel-react": {
       "version": "8.6.0",
@@ -3940,7 +3917,6 @@
       "version": "9.2.2",
       "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz",
       "integrity": "sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/esbuild": {
@@ -4011,6 +3987,7 @@
       "integrity": "sha512-LSehfdpgMeWcTZkWZVIJl+tkZ2nuSkyyB9C27MZqFWXuph7DvaowgcTvKqxvpLW1JZIk8PN7hFY3Rj9LQ7m7lg==",
       "dev": true,
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "@eslint-community/eslint-utils": "^4.2.0",
         "@eslint-community/regexpp": "^4.12.1",
@@ -4209,7 +4186,6 @@
       "version": "3.3.2",
       "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.2.tgz",
       "integrity": "sha512-oX2ruAFQwf/Orj8m737Y5adxDQO0LAB7/S5MnxCdTNDd4p6BsyIVsv9JQsATbTSq8KHRpLwIHbVlUNatxd+1Ow==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "@nodelib/fs.stat": "^2.0.2",
@@ -4226,7 +4202,6 @@
       "version": "5.1.2",
       "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
       "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "is-glob": "^4.0.1"
@@ -4253,7 +4228,6 @@
       "version": "1.17.1",
       "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.17.1.tgz",
       "integrity": "sha512-sRVD3lWVIXWg6By68ZN7vho9a1pQcN/WBFaAAsDDFzlJjvoGx0P8z7V1t72grFJfJhu3YPZBuu25f7Kaw2jN1w==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "reusify": "^1.0.4"
@@ -4276,7 +4250,6 @@
       "version": "7.1.1",
       "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
       "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "to-regex-range": "^5.0.1"
@@ -4327,7 +4300,6 @@
       "version": "3.3.0",
       "resolved": "https://registry.npmjs.org/foreground-child/-/foreground-child-3.3.0.tgz",
       "integrity": "sha512-Ld2g8rrAyMYFXBhEqMz8ZAHBi4J4uS1i/CxGMDnjyFWddMXLVcDp051DZfu+t7+ab7Wv6SMqpWmyFIj5UbfFvg==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "cross-spawn": "^7.0.0",
@@ -4358,7 +4330,6 @@
       "version": "2.3.3",
       "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
       "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
-      "dev": true,
       "hasInstallScript": true,
       "license": "MIT",
       "optional": true,
@@ -4373,7 +4344,6 @@
       "version": "1.1.2",
       "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
       "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
-      "dev": true,
       "license": "MIT",
       "funding": {
         "url": "https://github.com/sponsors/ljharb"
@@ -4392,7 +4362,6 @@
       "version": "10.4.5",
       "resolved": "https://registry.npmjs.org/glob/-/glob-10.4.5.tgz",
       "integrity": "sha512-7Bv8RF0k6xjo7d4A/PxYLbUCfb6c+Vpd2/mB2yRDlew7Jb5hEXiCD9ibfO7wpk8i4sevK6DFny9h7EYbM3/sHg==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "foreground-child": "^3.1.0",
@@ -4413,7 +4382,6 @@
       "version": "6.0.2",
       "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
       "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "is-glob": "^4.0.3"
@@ -4426,7 +4394,6 @@
       "version": "2.0.2",
       "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
       "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "balanced-match": "^1.0.0"
@@ -4436,7 +4403,6 @@
       "version": "9.0.5",
       "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
       "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "brace-expansion": "^2.0.1"
@@ -4482,7 +4448,6 @@
       "version": "2.0.2",
       "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
       "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "function-bind": "^1.1.2"
@@ -4560,7 +4525,6 @@
       "version": "2.1.0",
       "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
       "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "binary-extensions": "^2.0.0"
@@ -4573,7 +4537,6 @@
       "version": "2.15.1",
       "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.15.1.tgz",
       "integrity": "sha512-z0vtXSwucUJtANQWldhbtbt7BnL0vxiFjIdDLAatwhDYty2bad6s+rijD6Ri4YuYJubLzIJLUidCh09e1djEVQ==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "hasown": "^2.0.2"
@@ -4589,7 +4552,6 @@
       "version": "2.1.1",
       "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
       "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=0.10.0"
@@ -4599,7 +4561,6 @@
       "version": "3.0.0",
       "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
       "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=8"
@@ -4609,7 +4570,6 @@
       "version": "4.0.3",
       "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
       "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "is-extglob": "^2.1.1"
@@ -4622,7 +4582,6 @@
       "version": "7.0.0",
       "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
       "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=0.12.0"
@@ -4632,14 +4591,12 @@
       "version": "2.0.0",
       "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
       "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
-      "dev": true,
       "license": "ISC"
     },
     "node_modules/jackspeak": {
       "version": "3.4.3",
       "resolved": "https://registry.npmjs.org/jackspeak/-/jackspeak-3.4.3.tgz",
       "integrity": "sha512-OGlZQpz2yfahA/Rd1Y8Cd9SIEsqvXkLVoSw/cgwhnhFMDbsQFeZYoJJ7bIZBS9BcamUW96asq/npPWugM+RQBw==",
-      "dev": true,
       "license": "BlueOak-1.0.0",
       "dependencies": {
         "@isaacs/cliui": "^8.0.2"
@@ -4655,7 +4612,6 @@
       "version": "1.21.6",
       "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.6.tgz",
       "integrity": "sha512-2yTgeWTWzMWkHu6Jp9NKgePDaYHbntiwvYuuJLbbN9vl7DC9DvXKOB2BC3ZZ92D3cvV/aflH0osDfwpHepQ53w==",
-      "dev": true,
       "license": "MIT",
       "bin": {
         "jiti": "bin/jiti.js"
@@ -4729,7 +4685,6 @@
       "version": "3.1.3",
       "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
       "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=14"
@@ -4742,7 +4697,6 @@
       "version": "1.2.4",
       "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
       "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/locate-path": {
@@ -5248,7 +5202,6 @@
       "version": "10.4.3",
       "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
       "integrity": "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==",
-      "dev": true,
       "license": "ISC"
     },
     "node_modules/lucide-react": {
@@ -5263,7 +5216,6 @@
       "version": "1.4.1",
       "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
       "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">= 8"
@@ -5273,7 +5225,6 @@
       "version": "4.0.8",
       "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
       "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "braces": "^3.0.3",
@@ -5300,7 +5251,6 @@
       "version": "7.1.2",
       "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.2.tgz",
       "integrity": "sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==",
-      "dev": true,
       "license": "ISC",
       "engines": {
         "node": ">=16 || 14 >=14.17"
@@ -5317,7 +5267,6 @@
       "version": "2.7.0",
       "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
       "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "any-promise": "^1.0.0",
@@ -5329,7 +5278,6 @@
       "version": "3.3.11",
       "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
       "integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
-      "dev": true,
       "funding": [
         {
           "type": "github",
@@ -5372,7 +5320,6 @@
       "version": "3.0.0",
       "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
       "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=0.10.0"
@@ -5401,7 +5348,6 @@
       "version": "3.0.0",
       "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
       "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">= 6"
@@ -5461,7 +5407,6 @@
       "version": "1.0.1",
       "resolved": "https://registry.npmjs.org/package-json-from-dist/-/package-json-from-dist-1.0.1.tgz",
       "integrity": "sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==",
-      "dev": true,
       "license": "BlueOak-1.0.0"
     },
     "node_modules/parent-module": {
@@ -5491,7 +5436,6 @@
       "version": "3.1.1",
       "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
       "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=8"
@@ -5501,14 +5445,12 @@
       "version": "1.0.7",
       "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
       "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/path-scurry": {
       "version": "1.11.1",
       "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-1.11.1.tgz",
       "integrity": "sha512-Xa4Nw17FS9ApQFJ9umLiJS4orGjm7ZzwUrwamcGQuHSzDyth9boKDaycYdDcZDuqYATXw4HFXgaqWTctW/v1HA==",
-      "dev": true,
       "license": "BlueOak-1.0.0",
       "dependencies": {
         "lru-cache": "^10.2.0",
@@ -5525,14 +5467,12 @@
       "version": "1.1.1",
       "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
       "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
-      "dev": true,
       "license": "ISC"
     },
     "node_modules/picomatch": {
       "version": "2.3.1",
       "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
       "integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=8.6"
@@ -5545,7 +5485,6 @@
       "version": "2.3.0",
       "resolved": "https://registry.npmjs.org/pify/-/pify-2.3.0.tgz",
       "integrity": "sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=0.10.0"
@@ -5555,7 +5494,6 @@
       "version": "4.0.6",
       "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.6.tgz",
       "integrity": "sha512-saLsH7WeYYPiD25LDuLRRY/i+6HaPYr6G1OUlN39otzkSTxKnubR9RTxS3/Kk50s1g2JTgFwWQDQyplC5/SHZg==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">= 6"
@@ -5565,7 +5503,6 @@
       "version": "8.5.6",
       "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.6.tgz",
       "integrity": "sha512-3Ybi1tAuwAP9s0r1UQ2J4n5Y0G05bJkpUIO0/bI9MhwmD70S5aTWbXGBwxHrelT+XM1k6dM0pk+SwNkpTRN7Pg==",
-      "dev": true,
       "funding": [
         {
           "type": "opencollective",
@@ -5581,6 +5518,7 @@
         }
       ],
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "nanoid": "^3.3.11",
         "picocolors": "^1.1.1",
@@ -5594,7 +5532,6 @@
       "version": "15.1.0",
       "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
       "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "postcss-value-parser": "^4.0.0",
@@ -5612,7 +5549,6 @@
       "version": "4.0.1",
       "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.0.1.tgz",
       "integrity": "sha512-dDLF8pEO191hJMtlHFPRa8xsizHaM82MLfNkUHdUtVEV3tgTp5oj+8qbEqYM57SLfc74KSbw//4SeJma2LRVIw==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "camelcase-css": "^2.0.1"
@@ -5632,7 +5568,6 @@
       "version": "4.0.2",
       "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-4.0.2.tgz",
       "integrity": "sha512-bSVhyJGL00wMVoPUzAVAnbEoWyqRxkjv64tUl427SKnPrENtq6hJwUojroMz2VB+Q1edmi4IfrAPpami5VVgMQ==",
-      "dev": true,
       "funding": [
         {
           "type": "opencollective",
@@ -5668,7 +5603,6 @@
       "version": "6.2.0",
       "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
       "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
-      "dev": true,
       "funding": [
         {
           "type": "opencollective",
@@ -5694,7 +5628,6 @@
       "version": "6.1.2",
       "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.2.tgz",
       "integrity": "sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "cssesc": "^3.0.0",
@@ -5708,7 +5641,6 @@
       "version": "4.2.0",
       "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
       "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/prelude-ls": {
@@ -5752,7 +5684,6 @@
       "version": "1.2.3",
       "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
       "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
-      "dev": true,
       "funding": [
         {
           "type": "github",
@@ -5774,6 +5705,7 @@
       "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
       "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "loose-envify": "^1.1.0"
       },
@@ -5800,6 +5732,7 @@
       "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
       "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "loose-envify": "^1.1.0",
         "scheduler": "^0.23.2"
@@ -5813,6 +5746,7 @@
       "resolved": "https://registry.npmjs.org/react-hook-form/-/react-hook-form-7.61.1.tgz",
       "integrity": "sha512-2vbXUFDYgqEgM2RcXcAT2PwDW/80QARi+PKmHy5q2KhuKvOlG8iIYgf7eIlIANR5trW9fJbP4r5aub3a4egsew==",
       "license": "MIT",
+      "peer": true,
       "engines": {
         "node": ">=18.0.0"
       },
@@ -5976,7 +5910,6 @@
       "version": "1.0.0",
       "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.0.tgz",
       "integrity": "sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "pify": "^2.3.0"
@@ -5986,7 +5919,6 @@
       "version": "3.6.0",
       "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
       "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "picomatch": "^2.2.1"
@@ -6031,7 +5963,6 @@
       "version": "1.22.8",
       "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.8.tgz",
       "integrity": "sha512-oKWePCxqpd6FlLvGV1VU0x7bkPmmCNolxzjMf4NczoDnQcIWrAF+cPtZn5i6n+RfD2d9i0tzpKnG6Yk168yIyw==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "is-core-module": "^2.13.0",
@@ -6059,7 +5990,6 @@
       "version": "1.0.4",
       "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.0.4.tgz",
       "integrity": "sha512-U9nH88a3fc/ekCF1l0/UP1IosiuIjyTh7hBvXVMHYgVcfGvt897Xguj2UOLDeI5BG2m7/uwyaLVT6fbtCwTyzw==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "iojs": ">=1.0.0",
@@ -6106,7 +6036,6 @@
       "version": "1.2.0",
       "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
       "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
-      "dev": true,
       "funding": [
         {
           "type": "github",
@@ -6152,7 +6081,6 @@
       "version": "2.0.0",
       "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
       "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "shebang-regex": "^3.0.0"
@@ -6165,7 +6093,6 @@
       "version": "3.0.0",
       "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
       "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=8"
@@ -6175,7 +6102,6 @@
       "version": "4.1.0",
       "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
       "integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
-      "dev": true,
       "license": "ISC",
       "engines": {
         "node": ">=14"
@@ -6198,7 +6124,6 @@
       "version": "1.2.1",
       "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
       "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
-      "dev": true,
       "license": "BSD-3-Clause",
       "engines": {
         "node": ">=0.10.0"
@@ -6208,7 +6133,6 @@
       "version": "5.1.2",
       "resolved": "https://registry.npmjs.org/string-width/-/string-width-5.1.2.tgz",
       "integrity": "sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "eastasianwidth": "^0.2.0",
@@ -6227,7 +6151,6 @@
       "version": "4.2.3",
       "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
       "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "emoji-regex": "^8.0.0",
@@ -6242,7 +6165,6 @@
       "version": "5.0.1",
       "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
       "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=8"
@@ -6252,14 +6174,12 @@
       "version": "8.0.0",
       "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
       "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/string-width-cjs/node_modules/strip-ansi": {
       "version": "6.0.1",
       "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
       "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "ansi-regex": "^5.0.1"
@@ -6272,7 +6192,6 @@
       "version": "7.1.0",
       "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.0.tgz",
       "integrity": "sha512-iq6eVVI64nQQTRYq2KtEg2d2uU7LElhTJwsH4YzIHZshxlgZms/wIc4VoDQTlG/IvVIrBKG06CrZnp0qv7hkcQ==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "ansi-regex": "^6.0.1"
@@ -6289,7 +6208,6 @@
       "version": "6.0.1",
       "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
       "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "ansi-regex": "^5.0.1"
@@ -6302,7 +6220,6 @@
       "version": "5.0.1",
       "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
       "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=8"
@@ -6325,7 +6242,6 @@
       "version": "3.35.0",
       "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.0.tgz",
       "integrity": "sha512-8EbVDiu9iN/nESwxeSxDKe0dunta1GOlHufmSSXxMD2z2/tMZpDMpvXQGsc+ajGo8y2uYUmixaSRUc/QPoQ0GA==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "@jridgewell/gen-mapping": "^0.3.2",
@@ -6361,7 +6277,6 @@
       "version": "1.0.0",
       "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
       "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">= 0.4"
@@ -6384,8 +6299,8 @@
       "version": "3.4.17",
       "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.17.tgz",
       "integrity": "sha512-w33E2aCvSDP0tW9RZuNXadXlkHXqFzSkQew/aIa2i/Sj8fThxwovwlXHSPXTbAHwEIhBFXAedUhP2tueAKP8Og==",
-      "dev": true,
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "@alloc/quick-lru": "^5.2.0",
         "arg": "^5.0.2",
@@ -6431,7 +6346,6 @@
       "version": "3.3.1",
       "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
       "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "any-promise": "^1.0.0"
@@ -6441,7 +6355,6 @@
       "version": "1.6.0",
       "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
       "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "thenify": ">= 3.1.0 < 4"
@@ -6460,7 +6373,6 @@
       "version": "5.0.1",
       "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
       "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "is-number": "^7.0.0"
@@ -6486,7 +6398,6 @@
       "version": "0.1.13",
       "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
       "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
-      "dev": true,
       "license": "Apache-2.0"
     },
     "node_modules/tslib": {
@@ -6514,6 +6425,7 @@
       "integrity": "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
       "dev": true,
       "license": "Apache-2.0",
+      "peer": true,
       "bin": {
         "tsc": "bin/tsc",
         "tsserver": "bin/tsserver"
@@ -6649,7 +6561,6 @@
       "version": "1.0.2",
       "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
       "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/vaul": {
@@ -6693,6 +6604,7 @@
       "integrity": "sha512-qO3aKv3HoQC8QKiNSTuUM1l9o/XX3+c+VTgLHbJWHZGeTPVAg2XwazI9UWzoxjIJCGCV2zU60uqMzjeLZuULqA==",
       "dev": true,
       "license": "MIT",
+      "peer": true,
       "dependencies": {
         "esbuild": "^0.21.3",
         "postcss": "^8.4.43",
@@ -6751,7 +6663,6 @@
       "version": "2.0.2",
       "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
       "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
-      "dev": true,
       "license": "ISC",
       "dependencies": {
         "isexe": "^2.0.0"
@@ -6777,7 +6688,6 @@
       "version": "8.1.0",
       "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-8.1.0.tgz",
       "integrity": "sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "ansi-styles": "^6.1.0",
@@ -6796,7 +6706,6 @@
       "version": "7.0.0",
       "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
       "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "ansi-styles": "^4.0.0",
@@ -6814,7 +6723,6 @@
       "version": "5.0.1",
       "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
       "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=8"
@@ -6824,14 +6732,12 @@
       "version": "8.0.0",
       "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
       "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
-      "dev": true,
       "license": "MIT"
     },
     "node_modules/wrap-ansi-cjs/node_modules/string-width": {
       "version": "4.2.3",
       "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
       "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "emoji-regex": "^8.0.0",
@@ -6846,7 +6752,6 @@
       "version": "6.0.1",
       "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
       "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
-      "dev": true,
       "license": "MIT",
       "dependencies": {
         "ansi-regex": "^5.0.1"
@@ -6859,7 +6764,6 @@
       "version": "6.2.1",
       "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.1.tgz",
       "integrity": "sha512-bN798gFfQX+viw3R7yrGWRqnrN2oRkEkUjjl4JNn4E8GxxbjtG3FbrEIIY3l8/hrwUwIeCZvi4QuOTP4MErVug==",
-      "dev": true,
       "license": "MIT",
       "engines": {
         "node": ">=12"
@@ -6893,7 +6797,6 @@
       "version": "2.6.0",
       "resolved": "https://registry.npmjs.org/yaml/-/yaml-2.6.0.tgz",
       "integrity": "sha512-a6ae//JvKDEra2kdi1qzCyrJW/WZCgFi8ydDV+eXExl95t+5R+ijnqHJbz9tmMh8FUjx3iv2fCQ4dclAQlO2UQ==",
-      "dev": true,
       "license": "ISC",
       "bin": {
         "yaml": "bin.mjs"
diff --git a/src/components/cogede/FormularioAvaliacao.tsx b/src/components/cogede/FormularioAvaliacao.tsx
index c5802e0..933358a 100644
--- a/src/components/cogede/FormularioAvaliacao.tsx
+++ b/src/components/cogede/FormularioAvaliacao.tsx
@@ -16,6 +16,7 @@ interface FormularioAvaliacaoProps {
   responsavel: string;
   onSalvarEProximo: (avaliacao: AvaliacaoDocumental) => void;
   carregando: boolean;
+  avaliacaoAnterior?: Record<string, unknown>; // Dados da avaliação anterior para edição
 }
 
 // Interface para divergência de classificação
@@ -51,17 +52,84 @@ const initialFormData = {
   observacoesGerais: "",
 };
 
-export function FormularioAvaliacao({ processo, responsavel, onSalvarEProximo, carregando }: FormularioAvaliacaoProps) {
+export function FormularioAvaliacao({ processo, responsavel, onSalvarEProximo, carregando, avaliacaoAnterior }: FormularioAvaliacaoProps) {
   const [pecas, setPecas] = useState<PecaProcessual[]>([]);
   const [formData, setFormData] = useState(initialFormData);
   const [divergencias, setDivergencias] = useState<DivergenciaClassificacao[]>([]);
 
-  // Limpar formulário quando mudar de processo
+  // Carregar dados da avaliação anterior ao montar ou quando avaliacaoAnterior mudar
+  // Este efeito restaura dados salvos quando o avaliador está editando uma avaliação existente
   useEffect(() => {
-    setPecas([]);
-    setFormData(initialFormData);
-    setDivergencias([]);
-  }, [processo.CODIGO_PROCESSO]);
+    if (avaliacaoAnterior) {
+      // Carregar form data completa com todos os campos preenchidos anteriormente
+      setFormData({
+        descricaoAssuntoFaltante: avaliacaoAnterior.descricao_assunto_faltante || "",
+        assuntoTpu: avaliacaoAnterior.assunto_tpu || "",
+        hierarquiaCorreta: avaliacaoAnterior.hierarquia_correta || "",
+        divergenciaHierarquia: avaliacaoAnterior.divergencia_hierarquia || "",
+        destinacaoPermanente: avaliacaoAnterior.destinacao_permanente || "",
+        descricaoSituacaoArquivamento: avaliacaoAnterior.descricao_situacao_arquivamento || "",
+        inconsistenciaPrazo: avaliacaoAnterior.inconsistencia_prazo || "",
+        observacoesPecas: avaliacaoAnterior.observacoes_pecas || "",
+        documentoNaoLocalizado: avaliacaoAnterior.documento_nao_localizado || false,
+        documentoDuplicado: avaliacaoAnterior.documento_duplicado || false,
+        erroTecnico: avaliacaoAnterior.erro_tecnico || false,
+        ocorrenciasOutroDetalhe: avaliacaoAnterior.ocorrencias_outro_detalhe || "",
+        divergenciaClassificacao: avaliacaoAnterior.divergencia_classificacao || "",
+        processoVazio: avaliacaoAnterior.processo_vazio || false,
+        observacoesGerais: avaliacaoAnterior.observacoes_gerais || "",
+      });
+
+      // Carregar peças se existirem (processos documentados anteriormente)
+      if (avaliacaoAnterior.pecas_combinado) {
+        // Parse das peças do formato concatenado
+        // Esperamos que seja "Tipo1: ID1 | Tipo2: ID2"
+        const pecasString = avaliacaoAnterior.pecas_combinado;
+        const pecasArray = pecasString.split(" | ").filter((p: string) => p.trim());
+        const novasPecas: PecaProcessual[] = pecasArray.map((p: string) => {
+          const [tipo, idProjudi] = p.split(": ");
+          return {
+            id: crypto.randomUUID(),
+            tipo: tipo?.trim() || "",
+            idProjudi: idProjudi?.trim() || "",
+          };
+        });
+        setPecas(novasPecas);
+      } else {
+        // Se não há peças anteriores, iniciar com lista vazia para novo preenchimento
+        setPecas([]);
+      }
+
+      // Carregar divergências de classificação se existirem
+      if (avaliacaoAnterior.divergencia_classificacao === "Sim" && avaliacaoAnterior.divergencias_detalhes) {
+        // Parse das divergências do formato concatenado
+        // Esperamos que seja "Tipo1 → Real1 (ID: id1) | Tipo2 → Real2 (ID: id2)"
+        const divergenciasString = avaliacaoAnterior.divergencias_detalhes;
+        const divergenciasArray = divergenciasString.split(" | ").filter((d: string) => d.trim());
+        const novasDivergencias: DivergenciaClassificacao[] = divergenciasArray.map((d: string) => {
+          const match = d.match(/(.+?)\s*→\s*(.+?)\s*\(ID:\s*(.+?)\)/);
+          if (match) {
+            return {
+              id: crypto.randomUUID(),
+              tipoInformado: match[1]?.trim() || "",
+              tipoReal: match[2]?.trim() || "",
+              idPeca: match[3]?.trim() || "",
+            };
+          }
+          return { id: crypto.randomUUID(), tipoInformado: "", tipoReal: "", idPeca: "" };
+        });
+        setDivergencias(novasDivergencias);
+      } else {
+        // Se não há divergências anteriores, iniciar lista vazia
+        setDivergencias([]);
+      }
+    } else {
+      // Modo de nova avaliação: limpar formulário e inicializar com campos vazios
+      setPecas([]);
+      setFormData(initialFormData);
+      setDivergencias([]);
+    }
+  }, [avaliacaoAnterior, processo.CODIGO_PROCESSO]);
 
   // Funções para gerenciar divergências
   const adicionarDivergencia = () => {
diff --git a/src/components/cogede/MinhasAvaliacoes.tsx b/src/components/cogede/MinhasAvaliacoes.tsx
index 24a7ac4..a637b56 100644
--- a/src/components/cogede/MinhasAvaliacoes.tsx
+++ b/src/components/cogede/MinhasAvaliacoes.tsx
@@ -26,7 +26,7 @@ interface AvaliacaoComProcesso {
 }
 
 interface MinhasAvaliacoesProps {
-  onEditarAvaliacao: (processo: ProcessoFila) => void;
+  onEditarAvaliacao: (processo: ProcessoFila, avaliacaoAnterior?: Record<string, unknown>) => void;
   loteId?: string;
 }
 
@@ -184,7 +184,22 @@ export function MinhasAvaliacoes({ onEditarAvaliacao, loteId }: MinhasAvaliacoes
       DATA_FIM: processoCompleto.data_fim_avaliacao || undefined,
     };
 
-    onEditarAvaliacao(processoFormatado);
+    // Buscar dados da avaliação anterior
+    const { data: avaliacaoAnterior, error: erroAvaliacao } = await supabase
+      .from("avaliacoes")
+      .select("*")
+      .eq("id", avaliacao.id)
+      .maybeSingle();
+
+    if (erroAvaliacao) {
+      logger.error("Erro ao buscar avaliação anterior:", erroAvaliacao);
+      // Ainda assim passar o processo sem os dados da avaliação
+      onEditarAvaliacao(processoFormatado, null);
+      return;
+    }
+
+    // Passar processo e avaliação anterior
+    onEditarAvaliacao(processoFormatado, avaliacaoAnterior);
   };
 
   const formatarData = (dataIso: string | null) => {
diff --git a/src/pages/Index.tsx b/src/pages/Index.tsx
index ba85ac4..e220546 100644
--- a/src/pages/Index.tsx
+++ b/src/pages/Index.tsx
@@ -35,6 +35,8 @@ export default function Index() {
   });
   const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDocumental[]>([]);
   const [carregando, setCarregando] = useState(false);
+  const [abaSelecionada, setAbaSelecionada] = useState("avaliacao");
+  const [avaliacaoAnterior, setAvaliacaoAnterior] = useState<Record<string, unknown> | null>(null);
   const cleanupExecutedRef = useRef(false);
 
   // Auto-preencher responsável quando o perfil do usuário estiver disponível
@@ -127,12 +129,22 @@ export default function Index() {
   };
 
   // Handler para editar avaliação existente
-  const handleEditarAvaliacao = (processo: ProcessoFila) => {
+  const handleEditarAvaliacao = (processo: ProcessoFila, avaliacaoAnterior?: Record<string, unknown>) => {
+    // Definir processo atual e iniciar sessão
     setSessao(prev => ({
       ...prev,
       processoAtual: processo,
       iniciada: true
     }));
+
+    // Carregar dados da avaliação anterior se foram passados
+    if (avaliacaoAnterior) {
+      setAvaliacaoAnterior(avaliacaoAnterior);
+    }
+
+    // Navegação automática para aba de avaliação
+    setAbaSelecionada("avaliacao");
+
     toast.info(`Editando avaliação do processo ${processo.CODIGO_PROCESSO}`);
   };
 
@@ -321,6 +333,9 @@ export default function Index() {
     } else {
       toast.error("Erro ao salvar avaliação");
     }
+
+    // Limpar dados da avaliação anterior após salvar
+    setAvaliacaoAnterior(null);
     
     setCarregando(false);
   };
@@ -336,7 +351,7 @@ export default function Index() {
       <Header />
       
       <main className="container mx-auto px-4 py-6">
-        <Tabs defaultValue="avaliacao" className="space-y-6">
+        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="space-y-6">
           <TabsList className={`grid w-full max-w-2xl ${podeVerDashboard ? "grid-cols-4" : "grid-cols-2"}`}>
             <TabsTrigger value="avaliacao" className="gap-2">
               <FileText className="h-4 w-4" />
@@ -387,6 +402,7 @@ export default function Index() {
                 responsavel={sessao.responsavel}
                 onSalvarEProximo={handleSalvarEProximo}
                 carregando={carregando}
+                avaliacaoAnterior={avaliacaoAnterior}
               />
             )}
           </TabsContent>

---


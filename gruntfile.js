// 명령어 사용법
// [user@server]$ grunt 명령어

var buildPath = "./build/";
var srcPath = "./src/";
var libPath = "./lib/";
var readmePath = "./README.md"

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        version : {
          defaults: {
            src : ['package.json']
          }
        },
        uglify: {
            options: {
                banner: 'console.log("gdApi version : <%= pkg.version %> build date : <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>");'
            },
            build: {
                src: buildPath + 'gdapi-<%= pkg.version %>.js',
                dest: buildPath + 'gdapi-<%= pkg.version %>.min.js'
            }
        },
        concat:{
            basic: {
                src: [libPath + '*.js', srcPath + '*.js'],
                dest: buildPath + 'gdapi-<%= pkg.version %>.js'
            },
            options: {
              banner: '/*\n * build date : <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n */\n',
              footer: '\ngdApi.VERSION = "<%= pkg.version %>"'
            }
        },
        // mocha : {
        //   all : {
        //     src : ['test/testrunner.html'],
        //   },
        //   options : {
        //     run : true
        //   }
        // },
        gitpull:{
          your_target : {
            options:{
              branch : 'develop'
            }
          }
        },
        gitcheckout: {
          your_target: {
            options: {
              branch : 'develop'
            }
          }
        },
        gitstash: {
          your_target: {
            options: {
            }
          }
        },
        gitmerge: {
          your_target: {
            options: {
              branch : 'develop'
            }
          }
        },
        gitadd: {
          task: {
            options: {
              force: true
            },
            files: {
              src: ['package.json']
            }
          }
        },
        gitcommit: {
          your_target: {
            options: {
              message : '<%= pkg.version %> update',
              allowEmpty: false
            },
            files: {
                // Specify the files you want to commit 
            }
          }
        },
        gitpush: {
          your_target: {
            options: {
              branch : 'master'
            }
          }
        },
    });
 
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-version');
    grunt.loadNpmTasks('grunt-git');
    // grunt.loadNpmTasks('grunt-string-replace');
    // grunt.loadNpmTasks('grunt-run');
    // grunt.loadNpmTasks('grunt-mocha');

    grunt.registerTask('pkgReload',function(){
      grunt.config.set('pkg',grunt.file.readJSON('package.json'));
    });

    grunt.registerTask('checkout:master',function(){
      grunt.config.set('gitcheckout.your_target.options.branch','master');
    });

    grunt.registerTask('checkout:develop',function(){
      grunt.config.set('gitcheckout.your_target.options.branch','develop');
    });

    // grunt.registerTask('sourceTest', ['mocha']);

    grunt.registerTask('testSetting',function(){
      grunt.config.set('concat',{
        basic : {
          src: [libPath + '*.js', srcPath + '*.js'],
          dest: 'build/gdapi-test.js'
        },
        options: {
          banner: '/*\n * build date : <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n */\n',
          footer: '\ngdApi.VERSION = "Testing on <%= pkg.version %>"'
        }
      })
    });


    grunt.registerTask('gitpatch', ['gitstash','gitcheckout','gitpull','checkout:master','gitcheckout','gitmerge','version::patch','pkgReload','gitadd','gitcommit','gitpush','concat','uglify']);
    
    grunt.registerTask('patch', ['version::patch','pkgReload','concat', 'uglify']);
    grunt.registerTask('minor', ['version::minor','pkgReload','concat', 'uglify']);
    grunt.registerTask('major', ['version::major','pkgReload','concat', 'uglify']);
    grunt.registerTask('test', ['testSetting','concat']);
};
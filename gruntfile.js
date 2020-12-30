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
                banner: 'console.log("h5Api version : <%= pkg.version %> build date : <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>");'
            },
            full: {
                src: buildPath + 'h5api-<%= pkg.version %>.js',
                dest: buildPath + 'h5api-<%= pkg.version %>.min.js'
            },
            ap: {
                src: buildPath + 'h5api-<%= pkg.version %>.ap.js',
                dest: buildPath + 'h5api-<%= pkg.version %>.ap.min.js'
            }
        },
        concat:{
            options: {
              banner: '/*\n * build date : <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n */\n',
            },
            basic: {
                src: [libPath + '*.js', 'index.js', srcPath + '*.js'],
                dest: buildPath + 'h5api-<%= pkg.version %>.js',
                options: {
                  footer: '\nh5Api.VERSION = "<%= pkg.version %>"'
                }
            },
            adPayment: {
                src: [`${libPath}*.js`, 'index.js', `${srcPath}01-common.js`, `${srcPath}ad.js`, `${srcPath}payment.js`, `${srcPath}style.js`],
                dest: buildPath + 'h5api-<%= pkg.version %>.ap.js',
                options: {
                  footer: '\nh5Api.VERSION = "<%= pkg.version %>"; h5Api.runMode = 2;'
                }
            }
        }
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

    grunt.registerTask('moduleTest',function(){
      grunt.config.set('concat',{
        basic : {
          src: [`${libPath}*.js`, 'index.js', `${srcPath}01-common.js`, `${srcPath}ad.js`, `${srcPath}payment.js`, `${srcPath}style.js`],
          dest: 'build/h5api-test.js'
        },
        options: {
          banner: '/*\n * build date : <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n */\n',
          footer: '\nh5Api.VERSION = "Testing on <%= pkg.version %>"; h5Api.runMode = 2;'
        }
      })
    });

    grunt.registerTask('testSetting',function(){
        grunt.config.set('concat',{
          basic : {
            src: [libPath + '*.js', 'index.js', srcPath + '*.js'],
            dest: 'build/h5api-test.js'
          },
          options: {
            banner: '/*\n * build date : <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n */\n',
            footer: '\nh5Api.VERSION = "Testing on <%= pkg.version %>"'
          }
        })
      });

    grunt.registerTask('gitpatch', ['gitstash','gitcheckout','gitpull','checkout:master','gitcheckout','gitmerge','version::patch','pkgReload','gitadd','gitcommit','gitpush','concat','uglify']);
    
    grunt.registerTask('patch', ['version::patch','pkgReload','concat', 'uglify']);
    grunt.registerTask('minor', ['version::minor','pkgReload','concat', 'uglify']);
    grunt.registerTask('major', ['version::major','pkgReload','concat', 'uglify']);
    grunt.registerTask('test',  ['testSetting','concat']);
    grunt.registerTask('build', ['pkgReload','concat', 'uglify:full']);
    grunt.registerTask('test-ad',  ['moduleTest', 'concat']);
    grunt.registerTask('adPayment', ['pkgReload','concat:adPayment', 'uglify:ap']); // uglify하면 왜 ima3 날아감?
};
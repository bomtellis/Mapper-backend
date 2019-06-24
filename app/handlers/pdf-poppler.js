const path = require('path');
const {execFile} = require('child_process');

const FORMATS = ['png', 'jpeg', 'tiff', 'pdf', 'ps', 'eps', 'svg'];
const EXEC_OPTS = {
    encoding: 'utf8',
    maxBuffer: 5000*1024,
    shell: false
};

let defaultOptions = {
    format: 'jpeg',
    scale: 1024,
    out_dir: null,
    out_prefix: null,
    page: null
};

// module.exports = function (file, out_file, page_start, page_end) {
module.exports.convert = function (file, opts) {
    return new Promise((resolve, reject) => {
        opts.format = FORMATS.includes(opts.format) ? opts.format : defaultOptions.format;
        opts.scale = opts.scale || defaultOptions.scale;
        opts.out_dir = opts.out_dir || defaultOptions.out_dir;
        opts.out_prefix = opts.out_prefix || path.dirname(file);
        opts.out_prefix = opts.out_prefix || path.basename(file, path.extname(file));
        opts.page = opts.page || defaultOptions.page;

        let args = [];
        args.push([`-${opts.format}`]);
        if (opts.page) {
            args.push(['-f']);
            args.push([parseInt(opts.page)]);
            args.push(['-l']);
            args.push([parseInt(opts.page)]);
        }
        if (opts.scale) {
            args.push(['-scale-to']);
            args.push([parseInt(opts.scale)]);
        }
        //dpi increase
        args.push(['-r']);
        args.push([parseInt(300)]);
        args.push(`${file}`);
        args.push(`${path.join(opts.out_dir, opts.out_prefix)}`);

        execFile('pdftocairo', args, EXEC_OPTS, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(stdout);
            }
        });
    });
};

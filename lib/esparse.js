let espree = require('espree'),
    util = require('util');

module.exports = function(src, opts, fn) {
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    }

    if (src && typeof src === 'object' && src.constructor.name === 'Buffer') {
        src = src.toString();
    } else if (src && typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }

    src = src === undefined ? opts.source : src;
    if (typeof src !== 'string') {
        src = String(src);
    }

    let parser = opts.parser || espree;
    let ast = parser.parse(src, opts);

    let result = {
        chunks: src.split(''),
        toString: function() { return result.chunks.join(''); },
        inspect: function() { return result.toString(); }
    };

    if (util.inspect.custom) {
        result[util.inspect.custom] = result.toString;
    }

    (function walk(node, parent) {
        insertHelpers(node, parent, result.chunks);

        Object.keys(node).forEach(function _(key) {
            if (key === 'parent') { return; }

            let child = node[key];
            if (Array.isArray(child)) {
                child.forEach(function _(c) {
                    if (c && typeof c.type === 'string') {
                        walk(c, node);
                    }
                });
            } else if (child && typeof child.type === 'string') {
                walk(child, node);
            }
        });

        fn(node);
    })(ast, undefined);

    return result;
};

function insertHelpers(node, parent, chunks) {
    node.parent = parent;

    node.source = function() {
        return chunks.slice(node.start, node.end).join('');
    };

    if (node.update && typeof node.update === 'object') {
        let prev = node.update;
        Object.keys(prev).forEach(function _(key) {
            update[key] = prev[key];
        });
        node.update = update;
    } else {
        node.update = update;
    }

    function update(s) {
        chunks[node.start] = s;
        for (let i = node.start + 1; i < node.end; i++) {
            chunks[i] = '';
        }
    }
}
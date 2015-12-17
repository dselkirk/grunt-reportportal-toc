var options = {
    stage: 'render:post:page'
};
var cheerio = require('cheerio');
module.exports = function (params, callback) {
    'use strict';

    var $ = cheerio.load(params.content);
    var root = $("#toc"),
        thisOptions,
        stack = [root], // The upside-down stack keeps track of list elements
        currentLevel = 0,
        headingSelectors;

    // Defaults: plugin parameters override data attributes, which override our defaults
    thisOptions = {content: ".js-content", headings: "h1,h2,h3"};
    headingSelectors = thisOptions.headings.split(",");

    // Set up some automatic IDs if we do not already have them
    $(thisOptions.content).find(thisOptions.headings).attr("id", function (index, attr) {
        // Generate a valid ID: must start with a letter, and contain only letters and
        // numbers. All other characters are replaced with underscores.
        return attr ||
            $(this).text().replace(/^[^A-Za-z]*/, "").replace(/[^A-Za-z0-9]+/g, "_");
    }).each(function (i, elem) {

        // What level is the current heading?
        var elem = $(this),
            level = $(headingSelectors).map(function (index, selector) {
                return elem.is(selector) ? index : undefined;
            })[0];

        if (level > currentLevel) {
            // If the heading is at a deeper level than where we are, start a new nested
            // list, but only if we already have some list items in the parent. If we do
            // not, that means that we're skipping levels, so we can just add new list items
            // at the current level.
            // In the upside-down stack, unshift = push, and stack[0] = the top.
            var parentItem = stack[0].children("li").last();
            if (parentItem) {
             //   stack.unshift($(parentItem).append("<ul/>"));
            }
        } else {
            // Truncate the stack to the current level by chopping off the 'top' of the
            // stack. We also need to preserve at least one element in the stack - that is
            // the containing element.
            // stack.splice(0, Math.min(currentLevel - level, Math.max(stack.length - 1, 0)));
        }

        if (!elem.hasClass('not-toc')) {
            // Add the list item
            stack[0].append($("<li class='toc-level toc-level-"+level+"'/>").append(
                $("<a/>").text(elem.text()).attr("href", "#" + elem.attr("id"))
            ));
        };

        currentLevel = level;
        params.content = $.html();
    });

    params.content = $.html();
    callback();
};

module.exports.options = options;



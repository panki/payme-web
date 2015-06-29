var path = require('path');
var ejs = require('ejs');
var emailTemplates = require('email-templates');
var Promise = require("bluebird");

var parsedTemplates = {};

function init(templatesDir, options) {
    if (parsedTemplates[templatesDir]) {
        return Promise.resolve(parsedTemplates[templatesDir]);
    }
    return new Promise(function (resolve, reject) {
        emailTemplates(templatesDir, options, function (err, template) {
            if (err) {
                return reject(err);
            }
            parsedTemplates[templatesDir] = template;
            resolve(template);
        });
    });
}

function render(templatesDir, options, templateName, locals) {
    return init(templatesDir, options).then(function (template) {
        return Promise.props({
            body: new Promise(function (resolve, reject) {
                template(templateName, locals, function (err, html, text) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({
                        html: html,
                        text: text
                    });
                });
            }),
            subject: new Promise(function (resolve, reject) {
                ejs.renderFile(path.join(templatesDir, templateName, 'subject.ejs'), locals, function(err, content) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(content);
                });
            })
        });
    });
}

module.exports = function (templatesDir, options) {
    return function (templateName, locals) {
        return render(templatesDir, options || {}, templateName, locals);
    };
};
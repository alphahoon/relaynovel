var db = require('./database.js');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

function handle_req(req, checkfield, imagefolder, imagename, emptyimagepath, setpostdata, postquery, cberror, cbsuccess) {
    upload_file(req, function (req, entries) {
        checkfield(req, entries, function (err) {
            cberror(err);
        },
            function (req, entries) {
                var profile_pic;
                if (!entries.file.profile)
                    cberror('페이지오류: entries.fields.id항목이 없습니다');
                if (entries.file.profile.name) {
                    if (imagename == null && entries.fields.id)
                        imagename = entries.fields.id;
                    else
                        cberror('페이지오류: entries.fields.id항목이 없습니다');
                    profile_pic = imagefolder + entries.fields.id + path.extname(entries.file.profile.path);
                    var new_path = __dirname + '/public/' + profile_pic;
                    fs.rename(entries.file.profile.path, new_path);
                }
                else profile_pic = emptyimagepath;
                setpostdata(req, entries, profile_pic, function (req, postdata) {
                    if (typeof postdata == 'string') {
                        postquery = postquery.replace("?", postdata);
                        var query = db.connection.query(postquery, function (err) {
                            if (err) cberror(err);
                            else cbsuccess();
                        });
                    }
                    else {
                        var query = db.connection.query(postquery, postdata, function (err) {
                            if (err) cberror(err);
                            else cbsuccess();
                        });
                    }
                });
            });
    });
}

function upload_file(req, callback) {
    var form = new formidable.IncomingForm();
    // 파일 전송 시 첫번째 chunk가 전달되면 호출
    form.keepExtensions = true;
    // form.on('fileBegin', function (name, file) {
    //     console.log('fileBegin - ' + name + ':' + JSON.stringify(file));
    // })
    //     // 파일의 chunk가 전달될 때 마다 호출
    //     .on('progress', function (bytesReceived, bytesExpected) {
    //         console.log('progress: ' + bytesReceived + '/' + bytesExpected);
    //     })
    //     // 파일 전송도중 esc나 페이지 전환 등으로 중단될 때 호출
    //     .on('aborted', function () {
    //         console.log('aborted');
    //     })
    //     // error 발생 시 호출
    //     .on('error', function () {
    //         console.log('error');
    //     })
    //     // 파일 전송이 끝난 경우 호출
    //     .on('end', function () {
    //         console.log('end');
    //     });
    form.parse(req, function (err, fields, file) {
        var entries = {
            fields: fields,
            file: file
        };
        callback(req, entries);
    });
}
module.exports = { handle_req: handle_req };
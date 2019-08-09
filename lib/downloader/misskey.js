const electron = require('electron');
const remote = electron.remote;
const download = require('./download');
const notification = require('../notification');
const request = remote.require('request');

const misskey = function(input_url, save_dir){
  var url = remote.require('url');
  var parse_url = url.parse(input_url);
  var note_id = parse_url.pathname.match(/notes\/(.+)/)[1]

  var domain = parse_url.protocol + "//" + parse_url.host;

  var req = {
    url: domain + '/api/notes/show',
    method: 'POST',
    json: {
      "noteId": note_id
    }
  }

  console.log(note_id)
  request(req, async (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      if(body.uri){
        console.log("remote")
        set_status_text("Remote Posts.")
        get_img(body.uri)
        console.log(body.uri);

        return;
      }

      if(!body.files){
        set_status_text("No Image File");
        return;
      }

      var image_count = 0;
      for(i = 0; body.files.length > i; i++){
        var extension = body.files[i].name.match(/\.[a-zA-Z0-9]+$/);
        var file_name = "mk_" + body.user.username + "_";
        if(config.file_name_domain){
          file_name = file_name + parse_url.host + "_";
        }
        file_name = file_name + body.id + "_image" + image_count + extension;

        try{
          await download(body.files[i].url, file_name, save_dir);
        }catch{
          notification.error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
          return;
        }
        image_count++
      }
      notification.end_notification(image_count, save_dir + '/' + file_name);
  })
}

module.exports = misskey;

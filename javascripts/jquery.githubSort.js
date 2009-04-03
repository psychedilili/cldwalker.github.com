(function($) {
  $.githubSortInit = function(github_user) {
    if(typeof github_user == 'undefined') {github_user = location.href.match(/([^\/]+)\/?$/)[1];}
    $.getJSON("http://github.com/api/v1/json/"+github_user +"?callback=?", function(json) {
      loadRepoStats(json);
      $('li.project').each(function(i,e){ $(e).attr('id','repo-'+ i) });
      sourceSortPlugin();
      createSortBox();
    });
  };

  $.githubRepoSort = function(field, sort_direction) {
    if (field == 'name') {
      $('li.project').selso({orderBy:'div.title a', type:'alpha', direction:sort_direction});
      $("a.name_sort").toggle();
    }
    else if (field == 'watchers'){
      $('li.project').selso({orderBy:'span.watchers_num', type:'num', direction:sort_direction});
      $("a.watchers_sort").toggle();
    }
    else if (field == 'forks') {
      $('li.project').selso({orderBy:'span.forks_num', type:'num', direction:sort_direction});
      $("a.forks_sort").toggle();
    }
  };

  //private methods
function detect(array, callback) {
  return $.grep(array,callback)[0];
};

function addRepo(repo_div, json_repo) {
  repo_div.before("<span style='float:right; color:#4183C4'><span class='watchers_num'>" + json_repo.watchers + "</span> watchers<br/>" + 
    "<span class='forks_num'>" + json_repo.forks + "</span> forks" + '</span>');
};

function loadRepoStats(json) {
  $('div.title').each(function() {
    var repo_div = $(this);
    var repo_obj = detect(json.user.repositories, function(e) { 
      return e.url.match( new RegExp(repo_div.text()+ '$') ) 
    });
    if (repo_obj) {addRepo(repo_div, repo_obj);}
  });
};

function sourceSortPlugin() {
  var _s = document.createElement('script');
  _s.type='text/javascript';
  _s.src='http://plugins.jquery.com/files/jquery.selso-1.0.1.js.txt';
  document.getElementsByTagName('head')[0].appendChild(_s);
};

function createSortBox() {
  $('ul.projects').before("\
  <style type='text/css'>\
    .desc_sort {\
      background: url(http://tablesorter.com/themes/blue/asc.gif) no-repeat 0 center;\
      padding: 0 10px;\
    }\
    .asc_sort {\
      background: url(http://tablesorter.com/themes/blue/desc.gif) no-repeat 0 center;\
      padding: 0 10px;\
    }\
    .sort_label {\
      font-weight: bold;\
      color:#4183C4;\
    }\
    #sort_links {\
      text-align:center;\
      padding:2px;\
      margin-top:20px;\
      border:1px solid #D8D8D8;\
      background-color: #F0F0F0;\
    }\
    #sort_links_label {\
      font-style: italic;\
      font-size: 120%;\
      padding-right:10px;\
      color:#888;\
    }\
  </style>\
  <div id='sort_links'>\
    <span id='sort_links_label'>Sort Repositories:</span>\
    <span class='sort_label'>NAME</span>\
    <a class='name_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('name', 'asc')\"></a>\
    <a class='name_sort desc_sort' href=\"javascript:$.githubRepoSort('name', 'desc')\"></a>\
    | <span class='sort_label'>WATCHERS</span>\
    <a class='watchers_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('watchers', 'asc')\"></a>\
    <a class='watchers_sort desc_sort' href=\"javascript:$.githubRepoSort('watchers', 'desc')\"></a>\
    | <span class='sort_label'>FORKS</span>\
    <a class='forks_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('forks', 'asc')\"></a>\
    <a class='forks_sort desc_sort' href=\"javascript:$.githubRepoSort('forks', 'desc')\"></a>\
    </div>\
    ");
};
})(jQuery);
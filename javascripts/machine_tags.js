function has_tags(tag, tag_array) {
  return $(tag_array).any(function() {return this == tag});
}

function has_machine_tags(tag, tag_array) {
  return $(tag_array).any(function() {return !! this.match(tag.replace(/\*/g, '.*')) });  
}

function machine_tag_search(machine_tag) {
  $.getJSON("/posts.json", function(posts) {
    machine_tag_search_posts(machine_tag, posts);
  });
}
function machine_tag_search_posts(machine_tag, posts) {
  $('#result').html('');
  // if ((typeof $.machine_tagged_posts) == undefined) { fetch_posts; }
  // var posts = $.machine_tagged_posts;
  var matching_posts = (machine_tag == '') ? posts : $.grep(posts, function(e, i) {
    return has_machine_tags(machine_tag, e.tags);
  });
  
  if (matching_posts.length == 0) {
    var result = "<h3>No posts found for '" + machine_tag+ "'</h3>";
  }
  else {
    var result = "<h3>" + 
    ((machine_tag == '') ? "All posts" : "Posts tagged with '"+ machine_tag +"'") + 
    "</h3>" + "<table class='post-list'><thead>" + "<tr><th>Posts</th><th></th><th style='text-align:right'><a href=\
    'javascript:void($(\"a .machine_tag_prefix\").toggle())'>Toggle: Machine Tags/Tags</a></th></tr></thead><tbody>" +
    $.map(matching_posts, function(e,i) {
      return "<tr><th><a href='" +e.url+ "'>" +e.title+ "</a><th>\
      <td>"+ $.map(e.tags, function(f) { 
        return "<a href=\"javascript:machine_tag_search('" + f + "')" + "\">" +  "<span class='machine_tag_prefix'>" + 
        f.split('=')[0] + "=</span>" + f.split('=')[1] + "</a>"
      }).join(', ') + "</td></tr>"
    }).join(" ") + "</tbody></table>";
  }
  $("#result").append(result);
  location.href = location.href.replace(/#([a-z:=*]+)?$/, '') + "#" + machine_tag;
}

function initial_machine_tag() {
  return location.href.match(/#([a-z:=*]+)$/);
}
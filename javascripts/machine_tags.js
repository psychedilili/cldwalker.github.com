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

function find_machine_tags(wildcard_machine_tag, posts) {
  var machine_tags = [];
  var machine_tag_query = wildcard_machine_tag.replace(/\*/g, '.*');
  $.each(posts, function(i,e) {
    $.each(e.tags, function(j,f) {
      if ((!! f.match(machine_tag_query)) && ($.inArray(f, machine_tags) == -1)) {
        machine_tags.push(f);
      }
    });
    // var matching_tags = $.grep(e.tags, function(f) {
    //   return !! f.match(machine_tag.replace(/\*/g, '.*')) 
    // });
    // $.merge(machine_tags, matching_tags);
  });
  machine_tags.sort();
  return machine_tags;
}

function machine_tag_fields(machine_tag) {
  var fields = machine_tag.split(/[:=]/);
  return {namespace: fields[0], predicate: fields[1], value: fields[2]};
}

function machine_tag_search_posts(machine_tag, posts) {
  $('#result').html('');
  var machine_tags = find_machine_tags(machine_tag, posts);
  var rows = [];
  $.each(machine_tags, function(i,tag) {
    var mtag = machine_tag_fields(tag);
    var tag_rows = [{tag: mtag.namespace,mtag: mtag, level:0}, {tag: mtag.predicate,mtag: mtag, level:1}, 
      {tag: mtag.value, mtag: mtag,level:2}];
    var tag_rows = $.grep(tag_rows, function(e) { 
      return ! $(rows).any(function() { return this.tag == e.tag && this.level == e.level && this.mtag.namespace == e.mtag.namespace &&
        (e.level == 2 ? this.mtag.predicate == e.mtag.predicate : true)
        });
    });
    var tagged_records = $.grep(posts, function(post, j) { return $.inArray(tag, post.tags) != -1});
    $.each(tagged_records, function(j,e) { tag_rows.push({level: 3, record: e}); });
    $.merge(rows, tag_rows);
  });
  
  prep_table(rows);
  var table = create_table(rows, {caption: (machine_tag == '' ? "All posts" : "Posts tagged with '"+ machine_tag +"'"),
    table_id: 'machine_tag_table'});
  $("#result").append(table);
  $("#machine_tag_table").treeTable({initialState: "expanded"});
  location.href = location.href.replace(/#([a-z:=*]+)?$/, '') + "#" + machine_tag;
}

function create_table(rows, options) {
  var result = "<table id='"+options.table_id+"'><caption>"+options.caption+"</caption>\
  <thead>\
    <tr>\
      <th width='30'>Tag Space</th>\
      <th>Post</th>\
      <th><a href='javascript:void($(\"a .machine_tag_prefix\").toggle())'>Toggle: Machine Tags/Tags</a></th>\
    </tr>\
  </thead><tbody>" +
  $.map(rows, function(e,i) {
    return "<tr id='"+ e.id + "'" + (typeof e.parent_id == 'number' ? " class='child-of-"+e.parent_id+"'" : '' ) +
    "><td>" + (e.tag ? e.tag : '')+ "</td><td>"+ (e.record ? "<a href='"+e.record.url+"'>"+e.record.title+"</a>" : '') + 
    "</td><td>"+ (e.record ? create_tag_links(e.record.tags) : '') + "</td></tr>";
  }).join(" ") + "</tbody></table>";
  return result;
}

function create_tag_links(tags) {
  return $.map(tags, function(f) { 
    return "<a href=\"javascript:machine_tag_search('" + f + "')" + "\">" +  "<span style='padding:0px; display:none' \
    class='machine_tag_prefix'>" + f.split('=')[0] + "=</span>" + f.split('=')[1] + "</a>"
  }).join(', ');
}
function initial_machine_tag() {
  return location.href.match(/#([a-z:=*]+)$/);
}

// adds parents + ids
function prep_table(array) {
  $(array).each(function(i,e) {
    e.id = i;
  });
  $(array).each(function(i,e) {
    if (parent = $.grep(array.slice(0, i).reverse(), 
      function(f) { return f.level < e.level})[0]) {
        e.parent_id = parent.id;
    }
  });
  return;
}

function machine_tag_search_posts_old(machine_tag, posts) {
  $('#result').html('');
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
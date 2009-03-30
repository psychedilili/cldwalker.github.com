

//demo functions

$.machine_tag_search_posts = function(machine_tag, posts) {
  $('#result').html('');
  var machine_tags = $.machineTagSearchRecordTags(machine_tag, posts);
  var rows = [];
  $.each(machine_tags, function(i,tag) {
    var mtag = $.machine_tag_fields(tag);
    var tagged_records = $.grep(posts, function(post, j) { return $.inArray(tag, post.tags) != -1});
    var tag_rows = [{tag: mtag.namespace,mtag: mtag, level:0}, {tag: mtag.predicate,mtag: mtag, level:1}, 
      {tag: mtag.value, mtag: mtag,level:2, record_count: $(tagged_records).size()}];
    var tag_rows = $.grep(tag_rows, function(e) { 
      return ! $.machineTag.any(rows, function(f) { return f.tag == e.tag && f.level == e.level && f.mtag.namespace == e.mtag.namespace &&
        (e.level == 2 ? f.mtag.predicate == e.mtag.predicate : true)
      });
    });
    $.each(tagged_records, function(j,e) { tag_rows.push({level: 3, record: e}); });
    $.merge(rows, tag_rows);
  });
  
  prep_table(rows);
  var table = create_table(rows, {caption: (machine_tag == '' ? "All posts" : "Posts tagged with '"+ machine_tag +"'"),
    table_id: 'machine_tag_table'});
  $("#result").append(table);
  $("a.machine_tag_search").click(function() { $.machineTagSearch($(this).text())});
  $("#machine_tag_table").treeTable({initialState: "expanded"});
  location.href = location.href.replace(/#([a-z:=*]+)?$/, '') + "#" + machine_tag;
}

function create_table(rows, options) {
  var result = "<table id='"+options.table_id+"'><caption>"+options.caption+"</caption>\
  <thead>\
    <tr>\
      <th>Tag Space <a href='javascript:void($(\"tr[level=2]\").each(function(){$(this).toggleBranch()}))'>\
      (Collapse/Expand)</a></th><th>Posts</th>\
      <th>Post Tags <a href='javascript:void($(\"a .machine_tag_prefix\").toggle())'>(Toggle Machine Tags)</a></th>\
    </tr>\
  </thead><tbody>" +
  $.map(rows, function(e,i) {
    return "<tr id='"+ e.id + "'" + (typeof e.parent_id != 'undefined' ? " class='child-of-"+e.parent_id+"'" : '' ) +
    "level='"+e.level+"'><td>" + (e.tag ? e.tag : '')+ (e.record_count ? " ("+e.record_count+")" : '') +
     "</td><td>"+ (e.record ? "<a href='"+e.record.url+"'>"+e.record.title+"</a>" : '') + 
    "</td><td>"+ (e.record ? create_tag_links(e.record.tags) : '') + "</td></tr>";
  }).join(" ") + "</tbody></table>";
  return result;
}

function create_tag_links(tags) {
  return $.map(tags, function(f) { 
    return "<a class='machine_tag_search' href='#'><span style='padding:0px; display:none' \
    class='machine_tag_prefix'>" + f.split('=')[0] + "=</span>" + f.split('=')[1] + "</a>"
  }).join(', ');
}

// adds parents + ids
function prep_table(array) {
  $(array).each(function(i,e) {
    e.id = "node-"+ i;
  });
  $(array).each(function(i,e) {
    if (parent = $.grep(array.slice(0, i).reverse(), 
      function(f) { return f.level < e.level})[0]) {
        e.parent_id = parent.id;
    }
  });
  $(array).each(function(i,e) {
    if (e.level < 2) {
      var record_count_sum = 0;
      var child_index = i + 1;
      while(array[child_index] && e.level < array[child_index].level) {
        if (array[child_index].record_count) {
          record_count_sum += array[child_index].record_count;
        }
        child_index += 1;
      }
      if (record_count_sum > 0) { e.record_count = record_count_sum; }
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
    'javascript:void($(\"a .machine_tag_prefix\").toggle())'>Toggle: Tags/Machine Tags</a></th></tr></thead><tbody>" +
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

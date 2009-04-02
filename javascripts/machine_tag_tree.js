// Creates an array of tree node objects to display the results of a machine tag search.
// Nodes are either tag or record nodes. Tag nodes represent different parts of a machine tag (namespace, predicate, value).
// Each tree node can have the following attributes:
//  * level (all nodes): Indicates level in a tree. A top level has a value of 0.
//  * tag (tag node): Indicates a tag fields' value.
//  * mtag (tag node): A tag's machine tag.
//  * record_count (tag node): Record count under a tag. Only set for a value tag node.
//  * record (record node): Reference to record.
$.createMachineTagTree = function(wildcard_machine_tag, records) {
  var machine_tags = $.machineTagSearchRecordTags(wildcard_machine_tag, records);
  var rows = [];
  $.each(machine_tags, function(i,tag) {
    var mtag = $.machineTag(tag);
    var tagged_records = $.grep(records, function(post, j) { return $.inArray(tag, post.tags) != -1});
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
  return rows;
};

var displayMachineTagTreeOptions = {recordName: 'Records'};
function displayMachineTagTree(wildcard_machine_tag, records, options) {
  var options = $.extend(displayMachineTagTreeOptions, options || {});
  $('#tag_tree').html('');
  var rows = $.createMachineTagTree(wildcard_machine_tag, records);
  $.temp = rows;
  if ($(rows).size() == 0) {
    var table_html = "<div class='caption'>No " + options.recordName.toLowerCase() + " found for '" + wildcard_machine_tag+ "'</div>";
  }
  else {
    setupTreeTable(rows);
    var table_html = createTable(rows, $.extend(options, {caption: (wildcard_machine_tag == '' ? "All "+options.recordName : 
      options.recordName+" tagged with '"+ wildcard_machine_tag +"'"), table_id: 'machine_tag_table'}));
  }
  $("#tag_tree").append(table_html);
  $("a.machine_tag_search").hideMachineTags();
  $("a.machine_tag_search").click(function() { $.machineTagSearch($(this).text());});
  $("a.machine_tag_href_search").click(function() { $.machineTagSearch(this.href.match(/#(.*?)$/).pop());});
  $("#machine_tag_table").treeTable({initialState: "expanded", indent:15});
};

function singularize(string) {
  return string.replace(/s$/,'')
};

function truncate(string,length) {
  return (string.length > length)  ? string.slice(0, length - 3) + '...' : string;
}

function machineTagQuery(tree_node) {
  var href = null;
  var mtag = tree_node.mtag;
  var base_href = tree_node.mtag.namespace+ $.machineTag.predicate_delimiter;
  switch (tree_node.level) {
    case 0: href = base_href + "*"; break;
    case 1: href = base_href + mtag.predicate + $.machineTag.value_delimiter + "*"; break;
    default: href = base_href+ mtag.predicate + $.machineTag.value_delimiter + mtag.value;
  }
  return href;
}

function createTable(rows, options) {
  var result = "<table id='"+options.table_id+"'><caption>"+options.caption+"</caption>\
  <thead>\
    <tr>\
      <th width='140'>Machine Tags <a href='javascript:void($(\"tr[level=2]\").each(function(){$(this).toggleBranch()}))'>\
      (Collapse/Expand)</a></th><th>"+ options.recordName +"</th><th>"+ singularize(options.recordName) +
      " Tags / <a href='javascript:void($.toggleHiddenMachineTags())'>Machine Tags</a></th>" +
      (options.comments_column ? '<th width="90">Comments</th>' : '') +
    "</tr>\
  </thead><tbody>" +
  $.map(rows, function(e,i) {
    tag_cell = (e.tag ? e.tag : '')+ (e.record_count ? " ("+e.record_count+")" : '');
    if (e.tag) tag_cell = "<a class='machine_tag_href_search' href='#" + machineTagQuery(e) + "'>"+ tag_cell + "</a>";
    comments_column = (options.comments_column ?
      (e.record ? "<td><a href='" + e.record.url+ "#disqus_thread'>Comments</a></td>" : "<td></td>")
      : '');
    
    return "<tr id='"+ e.id + "'" + (typeof e.parent_id != 'undefined' ? " class='child-of-"+e.parent_id+"'" : '' ) +
      "level='"+e.level+"'><td>" + tag_cell +"</td><td>"+ 
      (e.record ? "<a href='"+e.record.url+"'>"+truncate(e.record.title, 50)+"</a>" : '') + 
      "</td><td>"+ (e.record ? "<div class='record_tags_column'>"+createTagLinks(e.record.tags)+"</div>" : '') + 
      "</td>" + comments_column +"</tr>";
  }).join(" ") + "</tbody></table>";
  return result;
};

function createTagLinks(tags) {
  return $.map(tags, function(f) {
    return "<a class='machine_tag_search' href='#'>" + f + "</a>";
  }).join(', ');
};

// Adds parents + ids
function setupTreeTable(array) {
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
};
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

// Given a wildcard machine tag, returns the matching records in a tree table. The table has three columns: machine tags, primary, tags.
// Takes the following options:
//   * recordName: capitalized name to give the records, defaults to Records
//   * tag_tree_id: css id for the div containing the generated table, defaults to tag_tree
//   * table_id: css id for the generated table, defaults to machine_tag_table
//   * caption : caption/title for the table
//   * formatter : hash of columns to functions used to format the respective column,
//     hash keys are machine_tags_column, primary_column, tags_column
var machineTagTreeOptions = {};
function machineTagTree(wildcard_machine_tag, records, options) {
  var options = $.extend({recordName: 'Records', tag_tree_id: 'tag_tree', table_id: 'machine_tag_table', 
    wildcard_machine_tag: wildcard_machine_tag},machineTagTreeOptions, options || {});
  $('#'+options.tag_tree_id).html('');
  var rows = $.createMachineTagTree(wildcard_machine_tag, records);
  displayMachineTagTree(rows, options);
}

function displayMachineTagTree(rows, options) {
  if ($(rows).size() == 0) {
    var table_html = "<div class='caption'>No " + options.recordName.toLowerCase() + " found for '" + options.wildcard_machine_tag+ "'</div>";
    $("#"+options.tag_tree_id).append(table_html);
  }
  else {
    setupTreeTable(rows);
    var table_html = createTable(rows, options);
    $("#"+options.tag_tree_id).append(table_html);
    $("a.machine_tag_search").hideMachineTags();
    $("a.machine_tag_search").click(function() { $.machineTagSearch($(this).text());});
    $("a.machine_tag_href_search").click(function() { $.machineTagSearch(this.href.match(/#(.*?)$/).pop());});
    $("#"+options.table_id).treeTable({initialState: "expanded", indent:15});
  }
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
  var options = $.extend({ recordName: 'Records', table_id: 'machine_tag_table', caption: 'Machine Tag Search Results', 
    formatter: { primary_column: defaultPrimaryColumnFormatter, tags_column: defaultTagsColumnFormatter,
    machine_tags_column: defaultMachineTagsColumnFormatter}
    }, options || {});
  if (options.wildcard_machine_tag) options.caption = "All "+options.recordName+" for wildcard machine tag '"+
    options.wildcard_machine_tag +"'";
  var table = "<table id='"+options.table_id+"'><caption>"+options.caption+"</caption>\
  <thead>\
    <tr>\
      <th width='140'>Machine Tags <a href='javascript:void($(\"tr[level=2]\").each(function(){$(this).toggleBranch()}))'>\
      (Collapse/Expand)</a></th>\
      <th>"+ options.recordName +"</th>\
      <th>"+singularize(options.recordName)+" Tags / <a href='javascript:void($.toggleHiddenMachineTags())'>Machine Tags</a></th>\
    </tr>\
  </thead><tbody>" +
  $.map(rows, function(e,i) {
    return "<tr id='"+ e.id + "'" + (typeof e.parent_id != 'undefined' ? " class='child-of-"+e.parent_id+"'" : '' ) +
      "level='"+e.level+"'>" +
      "<td>"+(e.tag ? options.formatter.machine_tags_column.call(this, e) : '')+"</td>"+
      "<td>"+(e.record ? options.formatter.primary_column.call(this, e.record) : '')+"</td>" +
      "<td>"+(e.record ? options.formatter.tags_column.call(this, e.record) : '')+"</td>" +
      "</tr>";
  }).join(" ") + "</tbody></table>";
  return table;
};

function defaultMachineTagsColumnFormatter(row) {
  var link_text = row.tag + (row.record_count ? " ("+row.record_count+")" : '');
  return "<a class='machine_tag_href_search' href='#" + machineTagQuery(row) + "'>"+ link_text + "</a>";
}

function defaultPrimaryColumnFormatter(record) {
  return "<a href='"+record.url+"'>"+truncate(record.title || record.url, 50)+"</a>";
}

function defaultTagsColumnFormatter(record) {
  return "<div class='record_tags_column'>"+createTagLinks(record.tags)+"</div>";
}

function createTagLinks(tags) {
  return $.map(tags, function(f) {
    return "<a class='machine_tag_search' href='#"+ f+"'>" + f + "</a>";
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
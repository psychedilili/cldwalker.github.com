var displayMachineTagTreeOptions = {recordName: 'Records'};
function displayMachineTagTree(wildcard_machine_tag, records, options) {
  var options = $.extend(displayMachineTagTreeOptions, options || {});
  $('#result').html('');
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
  $("#result").append(table_html);
  $("a.machine_tag_search").click(function() { $.machineTagSearch($(this).text())});
  $("#machine_tag_table").treeTable({initialState: "expanded", indent:15});
};

function singularize(string) {
  return string.replace(/s$/,'')
};

function truncate(string,length) {
  return (string.length > length)  ? string.slice(0, length - 3) + '...' : string;
}

function createTable(rows, options) {
  var result = "<table id='"+options.table_id+"'><caption>"+options.caption+"</caption>\
  <thead>\
    <tr>\
      <th width='140'>Machine Tags <a href='javascript:void($(\"tr[level=2]\").each(function(){$(this).toggleBranch()}))'>\
      (Collapse/Expand)</a></th><th>"+ options.recordName +"</th><th>"+ singularize(options.recordName) +
      " Tags <a href='javascript:void($(\"a .machine_tag_prefix\").toggle())'>(Toggle Machine Tags)</a></th>\
    </tr>\
  </thead><tbody>" +
  $.map(rows, function(e,i) {
    return "<tr id='"+ e.id + "'" + (typeof e.parent_id != 'undefined' ? " class='child-of-"+e.parent_id+"'" : '' ) +
    "level='"+e.level+"'><td>" + (e.tag ? e.tag : '')+ (e.record_count ? " ("+e.record_count+")" : '') +
     "</td><td>"+ (e.record ? "<a href='"+e.record.url+"'>"+truncate(e.record.title, 50)+"</a>" : '') + 
    "</td><td>"+ (e.record ? createTagLinks(e.record.tags) : '') + "</td></tr>";
  }).join(" ") + "</tbody></table>";
  return result;
};

function createTagLinks(tags) {
  return $.map(tags, function(f) {
    var mtag = $.machineTag(f);
    return "<a class='machine_tag_search' href='#'><span style='padding:0px; display:none' \
    class='machine_tag_prefix'>" + mtag.namespace +$.machineTag.predicate_delimiter +mtag.predicate +
    $.machineTag.value_delimiter + "</span>" + mtag.value + "</a>"
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
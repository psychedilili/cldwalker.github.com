(function($) {
$.machineTagSearchLocation = function(options) {
  if (locationMachineTag() != null) {
    $.machineTagSearch(locationMachineTag().pop(), options);
  }
};

$.machineTagSearch = function(machine_tag, options) {
  var options = $.extend($.machineTagSearch.defaultOptions, options || {});
  if (options.records) {
    var records = machineTagSearchRecords(machine_tag, options.records);
  }
  else if (options.jsonUrl) {
    $.getJSON(options.jsonUrl, function(json_records) {
      var records = machineTagSearchRecords(machine_tag, json_records);
      if (options.callback) options.callback.call(this, machine_tag, records);
      $.temp = records;
    });
  }
  return records;
};
$.machineTagSearch.defaultOptions = {};

$.machineTagSearchRecordTags = function(wildcard_machine_tag, records) {
  var machine_tags = [];
  var machine_tag_query = wildcard_machine_tag.replace(/\*/g, '.*');
  $.each(records, function(i,e) {
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
};

$.machine_tag_fields = function(machine_tag) {
  var fields = machine_tag.split(/[:=]/);
  return {namespace: fields[0], predicate: fields[1], value: fields[2]};
};

$.machineTag = {};
$.machineTag.any = function(array, callback) {
  return $($.grep(array, callback)).size() > 0
};

//private methods
function has_tags(tag, tag_array) {
  return $.machineTag.any(tag_array, function() {return e == tag});
};

function has_machine_tags(tag, tag_array) {
  return $.machineTag.any(tag_array, function(e) {return !! e.match(tag.replace(/\*/g, '.*')) });  
};

function machineTagSearchRecords(machine_tag, records) {
  return $.grep(records, function(e, i) {
    return has_machine_tags(machine_tag, e.tags);
  });
};

function locationMachineTag() {
  return location.href.match(/#(.*?)$/);
};
})(jQuery);
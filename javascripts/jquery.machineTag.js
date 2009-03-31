(function($) {
  var cached_json_records;
  
  // Wrapper around machineTagSearch() which assumes wildcard is appended to the end of the url after a '#'
  // ie http://example.com/tag_search#wildcard.
  $.machineTagSearchLocation = function(options) {
    if (locationMachineTag() != null) {
      $.machineTagSearch(locationMachineTag().pop(), options);
    }
  };
  
  // Returns machine-tagged items that match wildcard machine tag.
  // These options have a global default with $.machineTagSearch.defaultOptions
  // Options: Either records or jsonUrl is required.
  //   * cacheJson: cache records from first json call, default is true
  //   * records: an array of machine-tagged records
  //   * jsonUrl: a json url which represents an array of machine-tagged records
  //   * beforeSearch: before search callback i.e. to display a spinner
  //   * afterSearch: after search callback i.e. to hide a spinner
  //   * displayCallback: display callback is passed wildcard machine tag + matching records
  $.machineTagSearch = function(wildcard_machine_tag, options) {
    var options = $.extend({cacheJson: true}, $.machineTagSearch.defaultOptions, options || {});
    if (options.beforeSearch) options.beforeSearch.call(this);
    if (options.records) {
      var matching_records = machineTagSearchBody(wildcard_machine_tag, options.records, options);
    }
    else if (options.cacheJson && typeof(cached_json_records) != 'undefined') {
      var matching_records = machineTagSearchBody(wildcard_machine_tag, cached_json_records, options);
    }
    else if (options.jsonUrl) {
      $.getJSON(options.jsonUrl, function(json_records) {
        cached_json_records = json_records;
        var matching_records = machineTagSearchBody(wildcard_machine_tag, json_records, options);
      });
    }
    return matching_records;
  };

  function machineTagSearchBody(wildcard_machine_tag, records, options) {
    var matching_records = machineTagSearchRecords(wildcard_machine_tag, records);
    if (options.afterSearch) options.afterSearch.call(this);
    if (options.displayCallback) options.displayCallback.call(this, wildcard_machine_tag, matching_records);
    location.href = location.href.replace(/#(.*?)$/, '') + "#" + wildcard_machine_tag;
    return matching_records;
  };

  $.machineTagSearch.defaultOptions = {};
  
  // Returns tags from machine-tagged items that match the wildcard machine tag.
  $.machineTagSearchRecordTags = function(wildcard_machine_tag, records) {
    var machine_tags = [];
    $.each(records, function(i,e) {
      $.each(e.tags, function(j,f) {
        if (machineTagMatchesWildcard(f, wildcard_machine_tag) && ($.inArray(f, machine_tags) == -1)) {
          machine_tags.push(f);
        }
      });
    });
    machine_tags.sort();
    return machine_tags;
  };

  // Parses machine tag into its and returns namespace, predicate and value as object attributes.
  $.machineTag = function(machine_tag) {
    var fields = machine_tag.split(/[:=]/);
    return {namespace: fields[0], predicate: fields[1], value: fields[2]};
  };

  $.machineTag.predicate_delimiter = ':';
  $.machineTag.value_delimiter = '=';

  $.machineTag.any = function(array, callback) {
    return $($.grep(array, callback)).size() > 0
  };

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

  //private methods
  function anyMachineTagsMatchWildcard(machine_tags, wildcard_machine_tag) {
    return $.machineTag.any(machine_tags, function(e) {return machineTagMatchesWildcard(e, wildcard_machine_tag)});  
  };

  function machineTagMatchesWildcard(machine_tag, wildcard_machine_tag) {
   return !! machine_tag.match(wildcard_machine_tag.replace(/\*/g, '.*')) 
  };

  function machineTagSearchRecords(wildcard_machine_tag, records) {
    return $.grep(records, function(e) {
      return anyMachineTagsMatchWildcard(e.tags, wildcard_machine_tag);
    });
  };

  function locationMachineTag() {
    return location.href.match(/#(.*?)$/);
  };
})(jQuery);
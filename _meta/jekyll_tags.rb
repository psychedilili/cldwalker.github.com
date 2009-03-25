# helper methods used mainly for my Jekyll tags
module JekyllTags
  def all_tags
    tag_count.keys
  end

  def posts_dir
   File.join(root_dir, '_posts')
  end

  #Returns all posts under _posts
  def posts
    Dir["#{posts_dir}/**"].select {|e| e !~ /~$/ }
  end

  #array of posts with their tags
  def post_tags
    posts.map do |e|
      yaml = YAML::load_file(e)
      [e, yaml['tags']]
    end
  end

  #array of tags with their counts
  def tag_count
    count = {}
    post_tags.each do |post, tags|
      tags.each do |t|
        count[t] ||= 0
        count[t] += 1
      end
    end
    count
  end

  # Use this method to print the output of any methods returning data structures
  def debug(method)
    p send(method)
  end
end
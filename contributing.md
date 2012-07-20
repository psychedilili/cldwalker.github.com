---
layout: master
title: Contributing
---

Contributing
============

To make your helpful changes:

1. [Fork the project](http://help.github.com/fork-a-repo/)
2. Create a topic branch - `git checkout -b my_branch`
3. _Insert awesome code_
4. Push your branch - `git push origin my_branch`
5. [Make a pull request](http://help.github.com/send-pull-requests/)

Make sure to:
* add tests and documentation.
* follow the coding style of the project. When in doubt, [see this
  guide](https://github.com/chneukirchen/styleguide/blob/master/RUBY-STYLE).
* not modify or add to the development setup i.e. .gitignore
  * for ruby: Gemfile, Rakefile, or \*.gemspec.
  * for clojure: project.clj

For tests on a project:

* See the current testing status of a project: http://travis-ci.org/cldwalker/PROJECT i.e.
  [hirb](http://travis-ci.org/cldwalker/hirb)

* For ruby projects:
  * Try running them without bundler first: `gem install GEM_NAME --development && rake`
  * If that doesn't work, try bundler. If there's no Gemfile: `bundle init --gemspec=.gemspec`. Then
    `bundle install && bundle exec rake`
  * After changes, make sure tests pass on all supported ruby versions. See the rvm key of travis.yml.
* For clojure projects:
  * Run tests with `lein test`

---
layout: master
title: Contributing
---

## Contributing

### Reporting Issues

Reporting issues is a great way to help a project. However for it be helpful, you need to provide
enough information to make it _reproducible_. Before reporting, [check below](#windows_and_internationalization)
to see if your platform/issue is supported. I expect to see the following in an issue report:

* A reproducible set of steps that led you to the bug.
* If there is an exception, its full backtrace. Make sure to wrap output in [triple
  backticks](https://help.github.com/articles/github-flavored-markdown#syntax-highlighting)
* Language version
* Version of gem/clojar/library you are using e.g. `hirb 0.7.1`
* Your OS version e.g. `OSX 10.7`

Those who provide the above *get priority* over those who don't.

Additional data points I expect in a report by language:

* Ruby: Run `gem env` for Rubygems version, OS platform and ruby version manager
* Clojure: Run `lein -v` for Leiningen and Java version
* JS/HTML/CSS: Browser version

### Contributing Code

To make your helpful changes:

1. [Fork the project](http://help.github.com/fork-a-repo/)
2. Create a topic branch - `git checkout -b my_branch`
3. _Insert awesome code_
4. Push your branch - `git push origin my_branch`
5. [Make a pull request](http://help.github.com/send-pull-requests/)

Make sure to:

* add tests and documentation.
* follow the coding style of the project. When in doubt, see [this
  guide for ruby](https://github.com/chneukirchen/styleguide/blob/master/RUBY-STYLE) and
  [this guide for clojure](https://github.com/bbatsov/clojure-style-guide).
* not modify or add to the development setup i.e. .gitignore
  * for ruby: Gemfile, Rakefile, or \*.gemspec.
  * for clojure: project.clj
* not add support for older versions of a language unless the library
  mentions that it does. For clojure libraries, I'm supporting 1.4 and 1.5.
  For ruby libraries, I'm supporting 1.9.3 and 2.0

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

### Windows and Internationalization

I am open contributions that add support for Windows or internationalization. However, I don't need
either and thus will not actively support them other than to take contributions.


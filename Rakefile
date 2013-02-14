require "fileutils"

root = File.expand_path("..", __FILE__)

desc "install all gem dependencies"
task :bundle_install do
  bundle_cmd = "bundle install"

  %w(nats dea .).each do |component|
    sh "cd #{component} && #{bundle_cmd}"
  end
end

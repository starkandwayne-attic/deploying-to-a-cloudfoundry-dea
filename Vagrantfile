# -*- mode: ruby -*-
# vi: set ft=ruby :

init_script = <<BASH
#!/usr/bin/env bash

DISTRIB_CODENAME=lucid

if [[ "$(which ruby)" == "" || "${UPGRADE}X" != "X" || ! ("$(ruby -v)" =~ "ruby 1.9.3") ]]; then
  echo "Adding the Unboxed APT repository..."
  echo "deb http://apt.unboxedconsulting.com/ $DISTRIB_CODENAME main" > /etc/apt/sources.list.d/unboxed.list
  
  echo -e "\n Retrieving the PGP keys for the repository..."
  wget -O - http://apt.unboxedconsulting.com/release.asc | apt-key add -

  echo "Resynchronizing the package index files from their sources..."
  apt-get update

  echo -e "Installing Ruby 1.9.3...\n"
  apt-get -y install ubxd-ruby1.9.3 build-essential libsqlite3-dev curl rsync git-core libmysqlclient-dev libxml2-dev libxslt-dev libpq-dev libsqlite3-dev tmux

  echo -e "Upgrading to latest Rubygems..."
  gem update --system
  gem install bundler --no-ri --no-rdoc
else
  echo Ruby 1.9.3 already installed
fi

if [[ ! ("$(uname -r)" =~ "2.6.38-16") ]]; then
  sudo apt-get install -y linux-image-virtual-lts-backport-natty  
  echo "Rebooting to install new kernel NOW -- please wait..."
  sudo reboot now
else
  echo Linux kernel 2.6.38-16 already installed
fi

BASH

Vagrant::Config.run do |config|
  config.vm.box = "lucid64"
  config.vm.box_url = "http://files.vagrantup.com/lucid64.box"

  config.vm.provision :shell, :inline => init_script

  # Enable provisioning with chef solo, specifying a cookbooks path, roles
  # path, and data_bags path (all relative to this Vagrantfile), and adding 
  # some recipes and/or roles.
  #
  # config.vm.provision :chef_solo do |chef|
  #   chef.cookbooks_path = "../my-recipes/cookbooks"
  #   chef.roles_path = "../my-recipes/roles"
  #   chef.data_bags_path = "../my-recipes/data_bags"
  #   chef.add_recipe "mysql"
  #   chef.add_role "web"
  #
  #   # You may also specify custom JSON attributes:
  #   chef.json = { :mysql_password => "foo" }
  # end

 
end

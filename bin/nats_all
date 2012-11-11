#!/usr/bin/env ruby

require "nats/client"
require "json"

NATS.start do
  NATS.subscribe('vcap.component.announce') do |msg, reply, sub|
    data = JSON.parse(msg)
    host = data['host']
    username, password = data['credentials']
    puts "curl http://#{username}:#{password}@#{host}/healthz"
    puts `curl http://#{username}:#{password}@#{host}/healthz 2>/dev/null`
    puts "curl http://#{username}:#{password}@#{host}/varz"
    puts `curl http://#{username}:#{password}@#{host}/varz 2>/dev/null`
  end
  NATS.subscribe('>') { |msg, reply, sub| puts "Msg received on [#{sub}] : '#{msg}'" }
end
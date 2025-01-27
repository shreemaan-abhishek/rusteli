defmodule Shaderbackend.Application do
  use Application

  def start(_type, _args) do
    children = [
      {Plug.Cowboy, scheme: :http, plug: Shaderbackend, options: [port: 4000]}
    ]

    opts = [strategy: :one_for_one, name: Shaderbackend.Supervisor]
    Supervisor.start_link(children, opts)
  end
end

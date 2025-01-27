defmodule Cors do
  use Corsica.Router,
    origins: ["http://localhost:9091"]

  resource "/*"
end

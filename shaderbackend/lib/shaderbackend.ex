defmodule Shaderbackend do
  use Plug.Router

  plug Cors
  plug(:match)
  plug(:dispatch)

  @api_url "https://api.openai.com/v1/chat/completions"
  @api_key System.get_env("OPENAI_API_KEY")

  post "/" do
    {:ok, body, conn} = Plug.Conn.read_body(conn)
    response = send_request(body)
    send_resp(conn, 200, response)
    # send_resp(conn, 200, "Welcome to the Elixir HTTP Server!")
  end

  get "/hello/:name" do
    name = conn.params["name"]
    send_resp(conn, 200, "Hello, #{name}!")
  end

  post "/echo" do
    {:ok, body, conn} = Plug.Conn.read_body(conn)
    send_resp(conn, 200, "You posted: #{body}")
  end

  match _ do
    send_resp(conn, 404, "Oops! Page not found.")
  end

  def send_request(prompt) do
    headers = [
      {"Authorization", "Bearer #{@api_key}"},
      {"Content-Type", "application/json"}
    ]

    body = %{
      "model" => "gpt-4o",  # or "gpt-4"
      "messages" => [
        %{"role" => "developer", "content" => "Respond ONLY with the code for a WebGL program for the following prompt.
                                              Don't use any `document.` functions in the code, start directly by calling
                                              `.getContext(\"webgl\")` on `canvasRefCurrent` as if the `canvasRefCurrent`
                                              variable is already initialised."},
        %{"role" => "user", "content" => prompt}
      ],
      "stream" => false
    }
    |> Jason.encode!()

    case HTTPoison.post(@api_url, body, headers, [recv_timeout: 50_000]) do
      {:ok, %HTTPoison.Response{status_code: 200, body: response_body}} ->
        response_body
        |> Jason.decode!()
        |> IO.inspect()
        |> extract_reply()

      {:ok, %HTTPoison.Response{status_code: status_code, body: error_body}} ->
        IO.puts("Request failed with status #{status_code}")
        IO.inspect(error_body)

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.puts("Request failed: #{reason}")
    end
  end

  defp extract_reply(response) do
    response["choices"]
    |> List.first()
    |> Map.get("message")
    |> Map.get("content")
  end
end

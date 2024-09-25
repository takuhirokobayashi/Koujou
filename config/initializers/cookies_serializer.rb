Rails.application.config.middleware.delete ActionDispatch::Cookies
Rails.application.config.middleware.delete ActionDispatch::Session::CookieStore
Rails.application.config.middleware.delete ActionDispatch::Flash

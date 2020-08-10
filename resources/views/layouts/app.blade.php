    <!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'TouhouRPG') }}</title>

    <!-- Scripts -->
    <script src="{{ asset('js/app.js') }}"></script>
    @auth
    <script src="{{ asset('js/auth.js') }}"></script>
        <div id="userGlobal" value="{{ Auth::user()->nick }}"></div>
    @endauth
    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo asset('css/auth.css')?>" type="text/css">

</head>
<body>
    <div id="app">
        <nav class="navbar navbar-expand-md navbar-light bg-white shadow-sm">
            <div class="container">
                <a class="navbar-brand" href="{{ url('/') }}">
                    {{ config('app.name', 'TouhouRPG') }}
                </a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="{{ __('Toggle navigation') }}">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <!-- Left Side Of Navbar -->
                    @auth
                    <ul class="navbar-nav mr-auto">
                        @if(Auth::user()->role == "ADMIN")
                            <a href="/adminpanel">@lang('Admin panel')</a>
                        @endif
                            <a class="ml-3" href="/play">@lang('Play')</a>
                    </ul>
                    @endauth

                    <!-- Right Side Of Navbar -->
                    <ul class="navbar-nav ml-auto">
                        <!-- Authentication Links -->
                        @guest
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('login') }}">{{ __("Login") }}</a>
                            </li>
                            @if (Route::has('register'))
                                <li class="nav-item">
                                    <a class="nav-link" href="{{ route('register') }}">{{ __('Register') }}</a>
                                </li>
                            @endif

                        @else
                            <!-- aqui pones lo relacionado con el usuario -->
                            <img alt="profilePicture" src="{{ asset('pfp/'.Auth::user()->profilePicture) }}" width="50px" height="50px" style="margin-right: 10px;">
                            <a href="/u/{{Auth::user()->nick}}" class="nick">{{Auth::user()->nick}}</a>
                                <div id="msgDiv">
                                    <input type="image" src="/open-iconic/svg/envelope-closed.svg" class="inboxIcon mr-1" title="@lang('Message Inbox')" data-toggle="modal" data-target="#inboxModal">
                                    <div id="msgCount"></div>
                                </div>

                                <div class="modal fade" id="inboxModal" tabindex="-1" role="dialog" aria-labelledby="inboxModalLabel" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                @lang("Private Messages")
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>

                                            <div class="modal-body">
                                                <div id="listMessage"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="modal fade" id="privateMessageModal" tabindex="-1" role="dialog" aria-labelledby="privateMessageModalLabel" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                @lang("Private message")
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>

                                            <div class="modal-body">
                                                <div id="messageFrom"></div>
                                                <div id="messageSubject" class="float-left"></div>
                                                <div id="messageDate" class="float-right"></div>
                                                <br><br>
                                                <div style="background-color: beige" id="messageContent"></div>
                                                <br>
                                                <button class="btn-default btn btn-dark replyMessage">@lang("Reply")</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="modal fade" id="sendReplyModal" tabindex="-1" role="dialog" aria-labelledby="sendReplyModalLabel" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <div id="replyTo"></div>
                                                <button type="button" class="close text-center" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <div class="modal-body">

                                                <label for="replySubject" id="replySubjectLabel"></label>
                                                <br>
                                                <input type="text" id="replySubject" class="form-control">
                                                <br>
                                                <label for="replyMessage" id="replyMessageLabel"></label>
                                                <textarea id="replyMessage" rows="10" cols="50" class="form-control" placeholder="@lang("Write your private message (max. 1000 characters)")"></textarea>

                                                <button class="btn btn-default btn-dark mt-2 sendMessage">@lang("Send private message")</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <li class="nav-item dropdown">
                                <a id="navbarDropdown" class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-pre>
                                    {{ Auth::user()->name }} <span class="caret"></span>
                                </a>

                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                    <a class="dropdown-item" href="{{ route('logout') }}"
                                       onclick="event.preventDefault();
                                                     document.getElementById('logout-form').submit();">
                                        {{ __('Logout') }}
                                    </a>

                                    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                                        @csrf
                                    </form>
                                </div>
                            </li>
                        @endguest
                        <a href="/setlocale/en">
                            <img alt="en_flag" src="/img/en_flag.png"
                                 width="60" height="35">
                        </a>
                        <a href="/setlocale/es">
                            <img alt="es_flag" src="/img/es_flag.png"
                                 width="60" height="35" class="ml-3">
                        </a>
                    </ul>
                </div>
            </div>
        </nav>

        <main class="py-4">
            @yield('content')
        </main>
    </div>
</body>
</html>

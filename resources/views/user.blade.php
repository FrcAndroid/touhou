@extends('layouts.app')

<link rel="stylesheet" href="<?php echo asset('css/user.css')?>" type="text/css">

@if($userExists && $isBanned == 'false')
    @section('content')
        @auth
            <script src="{{asset('js/user.js')}}"></script>
            <div type="hidden" id="user" name="user" value="{{ Auth::user()->nick }}">
            <div type="hidden" id="userProfile" name="userProfile" value="{{ $userExists->nick }}">
        @endauth
            <div class="container userpage" >
            <div class="userleftbar">
                <!-- show profile picture -->
                <img id="profilepicture" class="profilepicture" src="{{ asset('pfp/'.$userExists['profilePicture']) }}">
                @if($isUser == "true")
                    <input type="image" src="/open-iconic/svg/data-transfer-upload.svg"  data-toggle="modal" data-target="#imgModal" class="userIcon mt-1 offset-9" title="@lang('Change profile picture')">
                    <!-- Modal -->
                    <div class="modal fade" id="imgModal" tabindex="-1" role="dialog" aria-labelledby="imgModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    @lang("Try to upload your picture in a 200x200 format, use common sense.")
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>

                                <div class="modal-body">
                                    <form enctype="multipart/form-data" id="formuploadajax" method="post">
                                        @csrf
                                        @lang('Image:')
                                        <br/>
                                        <input  type="file" id="file" name="file"/>
                                        <input type="submit" id="formsubmit" value="@lang('Upload image')"/>
                                    </form>
                                    <div id="message"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
                <div id="username" class="username">{{  $username  }}</div>
                    <div id="location" class="location mb-2">
                        <img src="/open-iconic/svg/location.svg" style="float: left"class="userIcon" title="@lang('Location')">
                            <div style="float: left" class="editable col-8" id="location" contenteditable="{{ $isUser }}">
                                @if($userExists->location)
                                {{ $userExists->location }}
                                @endif
                            </div>
                        </img>
                        <br>
                    </div>

                <div id="joined" class="joined">
                    <img src="/open-iconic/svg/account-login.svg" class="userIcon" title="@lang('Join Date')"> {{ $userExists->created_at }} </img>
                </div>
                @if($isUser == "false")
                    @auth <!-- only users can send messages or report -->
                <div id="useractions" class="useractions mt-3 offset-2">
                    <input type="image" src="/open-iconic/svg/envelope-closed.svg" class="userIcon mr-1" title="@lang('Send Message')" data-toggle="modal" data-target="#privateMessageModal">

                    <div class="modal fade" id="sendPrivateMessageModal" tabindex="-1" role="dialog" aria-labelledby="sendPrivateMessageModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    @lang("Message to: ") {{$userExists->nick}}
                                    <button type="button" class="close text-center" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">

                                    <label for="subjectMessage"> @lang("Subject: ")</label>
                                    <br>
                                    <input type="text" id="subjectMessage" class="form-control">
                                    <br>
                                    <label for="privateMessage">@lang("Message: ")</label><textarea id="privateMessage" rows="10" cols="50" class="form-control" placeholder="@lang("Write your private message (max. 1000 characters)")"></textarea>

                                    <button class="btn btn-default btn-dark mt-2 sendMessage">@lang("Send private message")</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <input type="image" src="/open-iconic/svg/warning.svg" class="userIcon" title="@lang('Report this user')" data-toggle="modal" data-target="#reportModal">

                    <div class="modal fade" id="reportModal" tabindex="-1" role="dialog" aria-labelledby="reportModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    @lang("Report ") {{$userExists->nick}}
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    @lang("State your reasons to report this user and provide any proof if you have any.")
                                    <br>
                                    <textarea  rows="10" cols="50" class="form-control" id="reportText"></textarea>
                                    <br>
                                    <button class="btn btn-default btn-danger reportButton">@lang("Send report")</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                        @endauth
                @endif

            </div>
            <div class="userrightbar">
                <!-- add description first -->
                <div id="about" class="about">
                @if($isUser == "true")
                        <!-- add modal -->
                        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#aboutModal">
                            ?
                        </button>

                        <!-- Modal -->
                        <div class="modal fade" id="aboutModal" tabindex="-1" role="dialog" aria-labelledby="aboutModalLabel" aria-hidden="true">
                            <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        {{__('You can edit your profile by clicking on the text fields and change your profile picture by clicking on the upload icon.')}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endif
                    <h2>@lang('About me')</h2>
                    <p class="aboutText editable" id='description' contenteditable="{{ $isUser }}">{{ $userExists->description }}</p>
                </div>

                <div id="stats" class="stats">
                    <h2>@lang('In-game stats')</h2>
                    <p>@lang('Characters owned:') {{ $userOwns->count() }}</p>
                    <p>@lang('Badges earned:') {{ $userExists->progress }}</p>
                </div>

                <div id="pastOffenses">
                    <h4 id="warningTitle">@lang("Warning history")</h4>
                    @forelse($pastWarnings as $warning)
                        <div class='cont' style='border: 1px solid'>
                            <div class='warningId' hidden>{{ $warning->id }}</div>
                            <div class='float-right'>{{ $fecha = date($warning->created_at) }}</div>
                            <a class='warnReason'>{{ $warning->reason }}</a>
                            </div><br>
                        @empty
                        <i>@lang('No warnings found')</i>
                    @endforelse

                    <h4 id="banTitle">@lang("Ban history")</h4>
                    @forelse($pastBans as $ban)
                        <div class='cont' style='border: 1px solid;'>
                            <div class='banId' hidden>{{ $ban->id }}</div>
                            <div class='float-right'>{{ $fecha = date($ban->created_at) }}</div>
                            <a class='banReason'>{{ $ban->reason }}</a>
                        </div><br>
                    @empty
                        <i>@lang('No bans found')</i>
                    @endforelse

                </div>
            </div>
        </div>

            </div></div>@endsection
@else
    <h1 id="404msg">@lang("User doesn't exist or might have been banned")</h1>
@endif

@extends('layouts.app')

<link rel="stylesheet" href="<?php echo asset('css/admin.css')?>" type="text/css">


@section('content')
    @auth
        @if(Auth::user()->role == "ADMIN")
            <script src="{{asset('js/admin.js')}}"></script>
            <div class="container ml-12">
                <h1>@lang('Admin panel')</h1>
                <div id="userList">
                    <table class="table table-striped table-bordered table-sm" data-toggle="table">
                        <th>@lang('Nick')</th>
                        <th>@lang('E-mail')</th>
                        <th>@lang('Role')</th>
                        <th>@lang('Status')</th>
                        <!-- mostraremos historico, reportes y baneos pendientes -->
                        @foreach($listaUsers as $users)
                            <?php $tieneReportes = false; $tieneBans = false; ?>
                                @foreach($listaReports as $report)
                                    @if($report->reported == $users->nick && $report->status == "Pending")
                                        <?php $tieneReportes = true; ?>
                                    @endif
                                @endforeach

                                @foreach($listaBans as $ban)
                                    @if($ban->user == $users->nick && $ban->status == "Active")
                                        <?php $tieneBans = true; ?>
                                    @endif
                                @endforeach
                            <tr>
                            <td>{{$users->nick}}</td>
                            <td>{{$users->email}}</td>
                            <td>{{$users->role}}</td>

                            <td>
                                <input type="image" src="/open-iconic/svg/file.svg" user="{{ $users->nick }}"  data-toggle="modal" data-target="#historyModal" class="historyIcon float-left mr-2 icon" title="@lang('History of this user')">
                            @if($tieneReportes == true)
                                        <input type="image" src="/open-iconic/svg/warning.svg" user="{{ $users->nick }}"  data-toggle="modal" data-target="#reportsModal" class="reportIcon float-left mr-2 icon" title="@lang('This user has pending reports')">
                            @endif
                            @if($tieneBans == true)
                                        <input type="image" src="/open-iconic/svg/ban.svg" user="{{ $users->nick }}" data-toggle="modal" data-target="#bansModal" class="banIcon float-left mr-2 icon" title="@lang('This user has active bans')">
                            @endif
                            </td>

                        @endforeach
                    </table>

                </div>
            </div>
        @endif
        <!-- Modal -->
        <div class="modal fade" id="historyModal" tabindex="-1" role="dialog" aria-labelledby="historyModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div id="historyHeaderMsg"> @lang("History of ") </div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    <div class="modal-body">
                        <h2 id="warningTitle">@lang("Warning history")</h2>
                        <div class="warningHistory">

                        </div>

                        <h2 id="banTitle">@lang("Ban history")</h2>

                        <div class="banHistory">

                        </div>

                        <textarea class="mt-2 form-control" placeholder="@lang("State your actions upon the processing of this warning.")" id="warningAddText"></textarea>
                        <button class="btn btn-info btn-warning" id="warningAdd">@lang('Warn user')</button>

                        <textarea class="mt-2 form-control" placeholder="@lang("State your actions upon the processing of this ban.")" id="banAddText"></textarea>
                        <button class="btn btn-info btn-danger" id="banAdd">@lang('Ban user')</button>

                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="reportsModal" tabindex="-1" role="dialog" aria-labelledby="reportsModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div id="reportHeaderMsg"> @lang("Pending reports of") </div>

                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="reportList">

                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="bansModal" tabindex="-1" role="dialog" aria-labelledby="bansModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                       <div id="banHeaderMsg"> @lang("Current active bans for ") </div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="banContent">

                        </div>
                        <textarea class="mt-2 form-control" placeholder="@lang("State your reasons for removing this ban.")" id="banHandlingText"></textarea>
                        <button class="btn btn-info btn-default" id="banProcess">@lang('Rescind ban')</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="reportHandlerModal" tabindex="-1" role="dialog" aria-labelledby="reportHandlerModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div id="headerMsg"> </div>

                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        @lang('Report content: ')
                        <br>
                        <div id="reportContent">

                        </div>
                        <textarea class="mt-2 form-control" placeholder="@lang("State your actions upon the processing of this report.")" id="reportHandlingText"></textarea>
                        <button class="btn btn-info btn-default" id="reportProcess">@lang('Process report')</button>
                    </div>
                </div>
            </div>
        </div>
    @endauth
@endsection

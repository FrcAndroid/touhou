@extends('layouts.app')

@auth
@section('content')

    <link rel="stylesheet" href="<?php echo asset('css/play.css')?>" type="text/css">
    <script>
        // "global" vars, built using blade
        var mapsUrl = '{{ asset('/sprites/maps/') }}';
        var playerSpritesUrl = '{{ asset('/sprites/player/') }}';

    </script>
    <script src="{{asset('js/play.js')}}"></script>
    <div id="user" hidden value="{{ $user }}"></div>

    <div id="playField">
        <div id="mainSprite">

        </div>
        <canvas width="600px" height="600px" id="eventSprite">

        </canvas>
        <div id="npcSpritePosition">

        </div>
        <div id="textBox">

        </div>
        <div id="userSprite">

        </div>
    </div>

    <div class="modal fade" id="inventoryModal" tabindex="-1" role="dialog" aria-labelledby="inventoryModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- characters, inventory, balance -->
                    <button class="btn btn-default btn-danger mt-2 characterButton">@lang("Characters")</button>
                    <button class="btn btn-default btn-info mt-2 itemsButton">@lang("Items")</button>
                    <button class="btn btn-default btn-warning mt-2 dataButton">@lang("Player data")</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="characterModal" tabindex="-1" role="dialog" aria-labelledby="characterModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content modal-xlg">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- characters -->
                    <div id="characterList">

                    </div>

                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="itemsModal" tabindex="-1" role="dialog" aria-labelledby="itemsModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="itemsDiv">

                    </div>

                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="dataModal" tabindex="-1" role="dialog" aria-labelledby="dataModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="cardDiv"></div>

                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="PCModal" tabindex="-1" role="dialog" aria-labelledby="PCModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-default btn-danger mt-2 characterButton">@lang("Sort characters")</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="shopModal" tabindex="-1" role="dialog" aria-labelledby="shopModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-default btn-danger mt-2 buyButton">@lang("Buy")</button>
                    <button class="btn btn-default btn-info mt-2 sellButton">@lang("Sell")</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="buyModal" tabindex="-1" role="dialog" aria-labelledby="buyModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="shopBuyList">

                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="sellModal" tabindex="-1" role="dialog" aria-labelledby="sellModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="shopSellList">

                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="itemUseModal" tabindex="-1" role="dialog" aria-labelledby="itemUseModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="itemUseList">

                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="battlePlayfield" hidden>
        <div id="trainerSide">
            <!-- position for sprite -->
            <div id="trainerSpriteDiv" class="battleSprite">
                <img id="trainerSprite" src="" hidden>
            </div>
            <!-- position for health bar and data -->
            <div id="trainerBar" class="battleBar">

            </div>
        </div>
        <div id="rivalSide">
            <div id="rivalSpriteDiv" class="battleSprite">
                <img id="rivalSprite" src="" hidden>
            </div>

            <div id="rivalBar" class="battleBar">

            </div>
        </div>
        <div id="buttonBar">
            <div id="button1">
                <!-- ATK -->
                <button class="btn btn-danger btn-default battleBtn" id="atkBtn">Attack</button>
            </div>
            <div id="button2">
                <!-- Items -->
                <button class="btn btn-info btn-default battleBtn" id="itemBtn">Items</button>
            </div>
            <div id="button3">
                <!-- Chars -->
                <button class="btn btn-warning btn-default battleBtn" id="charBtn">Characters</button>
            </div>
            <div id="button4">
                <!-- Escape -->
                <button class="btn btn-dark btn-default battleBtn" id="escBtn">Escape</button>
            </div>
        </div>
        <div id="battleText"></div>
    </div>

    <div class="modal fade" id="atkBattleModal" tabindex="-1" role="dialog" aria-labelledby="atkBattleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="atkList">
                        <div class="attackChoice" id="atkBtn1"></div>
                        <div class="attackChoice" id="atkBtn2"></div>
                        <div class="attackChoice" id="atkBtn3"></div>
                        <div class="attackChoice" id="atkBtn4"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="modal fade" id="charBattleModal" tabindex="-1" role="dialog" aria-labelledby="charBattleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="charList">

                    </div>
                </div>
            </div>
        </div>
    </div>

@endsection
@endauth

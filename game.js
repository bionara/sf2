
//inputs
var keys_pressed = [];
var keys_down = false;

//firebalsl etc
var fireball;
var fireballs = [];
var fireball_speed = 5;

//stores all enemies
var enemies = [];
var shells = [];
var coins = [];
var shell_speed = 5;
var enemy_start_x = 500;
var enemy_speed_x = 2;

//world vars
var world_floor = 207;
var world_bg = [];
var world_window = "#world-bg";
var world_right_side_reached = false;
var world_left_side_reached = false;
var world_scenary = [];

var screenWidth;
var screenHeight;
//duration of attacks, which last multi frames
var attack_dur_base = 10;
var speed_y = 3;
var speed_x = 4;
var gameloopId;
var speed=2;
var gameRunning = false;
var canvas;
var score = 0;
 


//////////////////////
//                  //
//  PLAYER OBJECT   //
//                  //
//////////////////////

var player = new Player();
function Player(){
    //set player position and move speeds
    this.hp = 100;
    this.power_up = false;
    this.x =100;
    this.y =world_floor;
    this.x_speed = 4;
    this.y_speed = 3;
    this.walking = false;
    this.is_on_platform=false;
    this.anim_strut = this.x_speed*2;
    //set player images
    this.img_set = new Object();
    this.img_set.main = new Image();
	this.img_set.current = new Image(); //used for updating image: punch,kick etc
	this.img_set.crouch = new Image();
	this.img_set.jump = new Image();
    this.img_set.punch = new Image();
    this.img_set.kick = new Image();
    this.img_set.hadoken = new Image();
    this.img_set.tetsu = new Image();
    //set special moves, combos etc
	this.anim_dur =6;
    this.special_combo = [];
    this.hit_box=false;
    this.jumping=false;
    this.jumping_dir=false; //can be up or down
    this.Jump = function(){
		console.log('JUMP');
		this.jump_dur_base = 55;
        this.jump_dur = this.jump_dur_base;
		this.jumping=true;
        this.jumping_dir="up";
        this.anim_dur=this.jump_dur_base;
	}
	this.Crouch = function(){
		console.log('CROUCH');
		this.img_set.current.src = "img/crouch.png";
		this.anim_dur=15;
	}
	this.Punch = function(){
		console.log('PUNCH');
		this.img_set.current.src = "img/punch.png";
		this.anim_dur=15;
        this.punch = true;
	}
	this.Kick = function(type){
		console.log('KICK');
        this.img_set.current.src = "img/kick.png";
        if(type=="low"){
            this.img_set.current.src = "img/kicklow.png";
        }
		this.anim_dur=15;
        this.kick = true;
	}
    this.Hit = function(){
        console.log('HIT!');
        this.hit_dur_base = 100 ;
        this.hit_dur = this.hit_dur_base;
        this.hit = true;
        this.anim_dur=this.hit_dur_base;
    }
    this.Knockout = function(){
        console.log('KNOCKOUT!');
        this.knockout = true;
    }
    this.PowerUp = function(){
        console.log('POWER UP');
        player.power_up = true;
        this.anim_dur=20;
    }
	this.BuildCombo = function(button){
        //only build comboi if powered up with mushist

    if(player.power_up){  
        this.special_combo.push(button);
        HpBar("powerup");
    }
        //console.log('Combo: '+ this.special_combo);
    }
    this.Hadoken = function(){
        console.log('HADOKEN!');
        this.hadoken_dur_base = 10;
        this.hadoken_dur = this.hadoken_dur_base;
        //create fireball
        var fireball = new Object();
        fireball.img_set = new Object();
        fireball.img_set.main = new Image();
        fireball.img_set.main.src = "img/fireball.png";
        fireball.x = this.x + 65;
        fireball.y = this.y+15;
        fireballs.push(fireball);
		this.anim_dur=this.hadoken_dur_base;
        this.hadoken = true;
    }
    this.Tetsumakiuken = function(){
        console.log('TETSUMAKIUKEN!');
        this.tetsu_dur_base = 60;
        this.tetsu_dur = this.tetsu_dur_base;
		this.anim_dur=this.tetsu_dur_base;
        this.tetsu = true;
    }
    this.DragonPunch = function(){
        console.log('DRAGONPUNCH!');
		this.anim_dur=60;
        this.dragon_dur_base = 60;
        this.dragon_dur = this.dragon_dur_base;
        this.dragon = true;
    }
}

//Create and load sounds
//var boing1 = new Audio("sounds/boing_1.mp3");




//////////////////////
//                  //
//  LEVEL BUILDER   //
//                  //
//////////////////////

//a mint object to store mapping of locations for scenary items. numbers are x and y coords
var world_layout = {
    "coin-boxes": [ [800,80], [1800, 90],
                  [2800, 60], [2904,80], [3600, 140],
                  [4750,100], [5250,80], [6000,100], [6750,35], [7250, 100],
                  [8845,190],  [8925,110], //jump on boxes to get above big pipe
                  [10270,30], [10700, 60], [10800, 100], 
                  [12500,80], [12600, 80], 
                  [14000,30],
                  [15000,50], [15750,50], [17000,100], 
                  [18000,50], [18700,30], [18750,50], [18800,70], [18850,90],
                  [19500,60], [19600,80]
                  ],
    "coins":      [ [1070,70],  [1100, 70], [1130, 70], [2070,100], [2100, 100], [2130, 100],
                    [2300, 0], [2330, 30], [2360, 50], [2390, 70], [2420, 90], //coin drop after plat
                    [3800, 0], [3800, 30], [3800, 60], [3800, 90], [3800, 120], //vert coin drop after plat
                    [7000, 90], [7030, 60], [7060, 30], [7090, 0], [7120, 30], [7150,60], [7180,90],//upside down v
                    [7920,120], [7950, 120], [7980, 120],
                    [10020,120], [10050, 120], [10080, 120], [10110, 120], [10140, 120],
                    [16520, 80], [16550, 80], [16580, 80],
                    [17820, 150], [17850, 150], [17880, 150],

                    //booya! at 2000
                    [20000, 30], [20000, 60], [20000,90], [20000,120], [20000,150], [20030, 30], [20030, 90], [20030,150],
                    [20060, 30], [20060, 60], [20060,120], [20060,150], //b
                    [20120, 60], [20120, 90], [20120, 120], [20150, 30], [20150, 150], [20180, 60], [20180,90], [20180,120],//o
                    [20240, 60], [20240, 90], [20240, 120], [20270, 30], [20270, 150], [20300, 60], [20300,90], [20300,120],//o
                    [20360, 90], [20390, 90], // -
                    [20450, 30], [20450, 60], [20480, 90],  [20480, 120], [20480, 150], [20510, 30], [20510, 60], [20510, 90], //y
                    [20570, 60], [20570, 90], [20570, 120], [20570, 150], [20600, 30], [20600, 90], [20630, 60], [20630,90], [20630,120], [20630, 150], //a
                    [20690, 30], [20690, 60], [20690, 90],  [20690, 10]


                  ], 
    "mushrooms":  [ [700, world_floor]
                  ],
    "pipes":      [[1530,world_floor-45, 'pipeplant'], 
                   [4000,world_floor+10], [4150, world_floor-40, 'pipeplant'], [4300, world_floor-110], //stacked 3
                   [8000,world_floor+10], [8150, world_floor-40], [8300, world_floor-110], //stacked 3
                   [9000,world_floor-120], //big pipe, have to coin box over 
                   [10250, world_floor+10],
                   [11950,world_floor-20, 'pipeplant'], [12150,world_floor-70], [12350,world_floor], //stacked 3
                   [17350,world_floor],
                   [18900,world_floor-30, 'pipeplant'], [19950,world_floor], [21000,world_floor-100], //stacked 3

                  ],
    "bushes":     [[1020, world_floor-82], [2350,world_floor+11], [3025,world_floor+11], [5550,world_floor+11],
                  [7050,world_floor+11], [7450,world_floor+11], [8800,world_floor+11], 
                  [10250,world_floor+11], [11850,world_floor+11], [12900,world_floor+11], [13750,world_floor+11], 
                  [16520,world_floor-32], [18900,world_floor+11], [19450,world_floor+11]
                  ],
    "platforms":  [[1000,world_floor-50], [2000,world_floor], [3250,world_floor],
                  [3500,world_floor-100], [6125,world_floor], [6700,world_floor-20], [7600,world_floor-25],                    
                  [14500,world_floor-20],[16500,world_floor]
                  ],
    "enemies":    [  ["fishing",700, 135], ["koopa",1150, world_floor],  ["pipeplant",2060,world_floor-60], ["koopa",2450, world_floor],
                  ["pipeplant", 7150, world_floor-70],
                  ["koopawing",3000, world_floor], ["koopawing",3800, world_floor],
                  ["koopawing",4250, world_floor], ["koopa",4600, world_floor], ["koopa",4800, world_floor],
                  ["football", 8900, world_floor], ["koopawing",9300, world_floor],["koopawing",9500, world_floor], 
                  ["koopa",9550, world_floor], ["football", 12750, world_floor], 
                  ["fishing",15000, 65], ["pipeplant",15000,world_floor-50], ["fishing",19000, 70],
                  ["football", 22000, world_floor], ["football", 22700, world_floor],["koopawing",25500, world_floor],  ["koopa",26000, world_floor], 
                   ["koopa",26200, world_floor],  ["pipeplant",22830,world_floor-30], ["fishing",24250, 70], ["football", 25000, world_floor],
                   ["fishing",27500, 70], ["koopawing",27300, world_floor], ["koopawing",27400, world_floor],
                    ["pipeplant",26830,world_floor-30]
                  ]
}



//////////////////////
//                  //
//    GAME INIT     //
//                  //
////////////////////// 
 
//Wait for DOM to load and init game
$(document).ready(function(){
    console.log(world_layout['coins']);
    init();
    //build scenary
    $(world_layout['platforms']).each(function(i, coords){
        world_scenary.push(new Scenary("platform", coords[0], coords[1]));
    });
    $(world_layout['coin-boxes']).each(function(i, coords){
        world_scenary.push(new Scenary("coinbox", coords[0], coords[1]));
    });
    $(world_layout['coins']).each(function(i, coords){
        world_scenary.push(new Scenary("coincollect", coords[0], coords[1]));
    });
    
    $(world_layout['pipes']).each(function(i, coords){
        world_scenary.push(new Scenary("pipe", coords[0], coords[1]));
    });
    $(world_layout['bushes']).each(function(i, coords){
        world_scenary.push(new Scenary("bush", coords[0], coords[1]));
    });
    $(world_layout['mushrooms']).each(function(i, coords){
        world_scenary.push(new Scenary("mushroom", coords[0], coords[1]));
    });
    //add one-offs
    world_scenary.push(new Scenary("mbison", 340, world_floor+15));
    world_scenary.push(new Scenary("startarrow", 355, world_floor-150));
    world_scenary.push(new Scenary("end", 20000, world_floor-100));
    //enemies are handled differently: added as player gets to that area of screen
    

});
 
function init(){
    initSettings();
    loadImages();
    //AddEnemy();

    //add event handler for clicking on start/stop button and toggle the game play
    $("#ss").click(function (){                       
        toggleGameplay();
    });

    //store array of all keys pressed down
    $(document).keydown(function (e) {
        keys_pressed[e.which] = true;  
        keys_down =true;
        //simple keydown switch for building combos        
        switch(e.which){
            case 37: //left
                player.BuildCombo("left");
            break;
            case 38: // up
                player.BuildCombo("up")
                if(!player.jumping){
                    player.Jump();
                }
            break;
            case 39: //right
                player.BuildCombo("right")
            break;
            case 40: // down
                player.BuildCombo("down")
            break;
            case 32: //space - jump
                AddEnemy("koopa");
            break;
            case 90: //z - punch
                player.Punch();
                player.BuildCombo("punch")
            break;
            case 88: //x - kick
				player.Kick("normal");
                player.BuildCombo("kick")
            break;
        }

        //ended checking keys. see if a sweet combo happend!!
        var last_three_combo_buttons = player.special_combo.slice(Math.max(player.special_combo.length - 3, 1)).toString();
        //console.log('Last 3 combo: '+last_three_combo_buttons);
        //a few hardcoded killer moves
        if(last_three_combo_buttons=='down,right,punch'){
            player.Hadoken();
        }
        if(last_three_combo_buttons=='down,left,kick'){
            player.Tetsumakiuken();
        }
        if(last_three_combo_buttons=='right,down,punch'){
            player.DragonPunch();
        }

    }); //end key listener
    
    //nullify keyups
    $(document).keyup(function (e) {
        delete keys_pressed[e.which];
        
    });
} //end init
 
function initSettings()
{
    //Get a handle to the 2d context of the canvas
    canvas = document.getElementById('canvas').getContext('2d');
    //Calulate screen height and width
    screenWidth = parseInt($("#canvas").attr("width"));
    screenHeight = parseInt($("#canvas").attr("height"));
}
 
//load all images for game
function loadImages()
{ 
    player.img_set.main.src = "img/player.png";
    player.img_set.kick.src = "img/kick.png"; 
    player.img_set.punch.src = "img/punch.png"; 
    player.img_set.hadoken.src = "img/hadoken.png"; 
    player.img_set.tetsu.src = "img/tetsusprite.png";
	player.img_set.crouch.src="img/crouch.png";
}



//////////////////////
//                  //
//    GAME LOOP     //
//                  //
//////////////////////
    
function gameLoop(){ 

    //Clear the screen (i.e. a draw a clear rectangle the size of the screen)
    canvas.clearRect(0, 0, screenWidth, screenHeight);
     
    //console.log(screenWidth)
    canvas.save(); 
     


    //////////////////////
    //                  //
    //     WALKING      //
    //                  //
    //////////////////////
    ExecuteSpecialMoves();
    var player_new_x_pos=player.x;
    var player_new_y_pos=player.y;

    player.walking = false;
    var stop_scroll = false;
    //set key handlers based on the keys_pressed array
    if(keys_pressed[37] && (!keys_pressed[40] && !player.tetsu && !player.dragon && !player.hit)){ //left
        if(!world_left_side_reached){
            player_new_x_pos -= player.x_speed;
        }

        world_right_side_reached = false;
        player.walking = true;
    }
    if(keys_pressed[39] && (!keys_pressed[40] && !player.tetsu && !player.dragon && !player.hit)){ //right
        if(!world_right_side_reached){
            player_new_x_pos += player.x_speed;
         }
         world_left_side_reached = false;
         player.walking = true;
    }
    if(keys_pressed[40]  && ( !player.tetsu && !player.dragon && !player.hit)){ //down
        player.Crouch();
    }

    //stop the walk if player wlaked into a pipe or box
    if(!player.is_on_platform){
        $(world_scenary).each(function(i,item){
            if(!item.can_walk_through){
                if(hitTestObject(player,item)){
                    //make sure player's left side isnt stuck on right of obj when trying to continue right
                    if((player.x < item.x && (keys_pressed[39] || player.tetsu || player.dragon)) 
                        || (player.x > item.x && (keys_pressed[37] || player.tetsu || player.dragon))
                      ){
                       player_new_x_pos = player.x;
                        //stop scroll too
                        stop_scroll = true;
                    }
                }  
            }
        });
    }
    
    //do we need to scroll the screen to keep player in mid?
    if(!stop_scroll){
        ScrollScreen();
    }
            
    player.x = player_new_x_pos;
    player.y = player_new_y_pos;
    //set the sprite for the player, which can change on punch and kick
    player.img_set.current = player.img_set.main;

    
    
    //////////////////////
    //                  //
    //     JUMPING      //
    //                  //
    //////////////////////
    
	if(player.jumping && player.jump_dur >= 0 && !player.hit){
    
		//up if less than half of jump dur
		if(player.jump_dur < (player.jump_dur_base/2)){
            player.jumping_dir = "down";
            //is set to up when jump button pressed
        }

        if(player.jumping_dir=="up")
        {

			player.img_set.current.src = "img/jump.png";            
            player.y -=4;
            //hitting coin boxes - can only hit one per jump
            if(world_scenary.length > 0){
                $(world_scenary).each(function(i,item){
                    if(item.type=="coinbox" &&  !player.hit_box){
                        if(hitTestObject(player, item)){
                            player.hit_box = true;
                            //if it hasnt been hit, nullify it
                            if(item.has_item){
                                item.img_set.main.src="img/items/coinboxdead.png";
                                item.has_item = false;
                                //create a coin - if it has one (not brown)
                                world_scenary.push(new Scenary("coin", item.x, item.y-75))
                                ScoreBar(100);
                            }
                            //player.jump_dur = player.jump_dur/2;
                            player.jumping_dir="down";
                        }
                    }
                });
            }   
		}else{ 
            //direction is down 
			if(player.y <= world_floor){ 
                player.y +=4; 
            }
            //see if landed on anything good like a platform
            if(LandOnPlatform()){
                console.log('LANDED-STOP JUMP');
                //stop the jump
                player.jump_dur = 0; 
                player.jumping = false;
                player.img_set.current.src = "img/player.png";
            }
            //if hit floor cancel altoghether
            if(player.y >207){ 
                player.y=207;
                player.jump_dur=0;
                player.jumping=false;
            }
		}
        player.jump_dur --;
		if (player.jump_dur <= 0){ 
            player.jumping = false; 
            player.hit_box=false;
            player.img_set.current.src = "img/player.png";
            //player.y = world_floor
        }
	}
    //apply gravity to player when not on platform etc
    if(player.y != world_floor && !LandOnPlatform() && !player.hadoken && !player.jumping && !player.tetsu && !player.dragon ){
        player.y +=4;
    }


    
    
    
    

    
    //toggle invulnerability after being hit etc
    if(player.hit){
        player.hit_dur--;
        player.img_set.current.src = "img/hit.png";
        if(player.hit_dur ==0){
            player.hit_dur = player.hit_dur_base;
            player.hit=false;
        }
        //also move to floor if jumping etc
        if(!player.is_on_platform && player.y < world_floor){
            player.y+=3;
        }
    } 
    
    
    
    //////////////////////
    //                  //
    //    HIT TESTS     //
    //                  //
    //////////////////////
    
    if(enemies.length >0){
   
        //first did we kick/punch enemy - or even get hit by it?
        if(!player.hit){
            $(enemies).each(function(i, enemy){
                if(hitTestObject(player, enemy)){

                    //if its a fisher, trigger his angry mode
                    if(enemy.type=="fishing"){
                            enemy.img_set.main.src="img/enemies/fishingnot.png";    
                            enemy.img_set.main2.src="img/enemies/fishingnot.png";    
                            enemy.fishing_hit = true;   
                            enemy.x_dir="right"; 
                            console.log('HIT FISHING');
                    }    
                    else{   //not a fishe,r so see if he hit us or we hit him
                        //1. killed enemy
                        if(player.kick || player.punch){
                            //if killed with special, make enemy explode and add momre points
                            //hadoken handled in fireball hit test
                            if( player.tetsu || player.dragon){
                                ScoreBar(250);
                                world_scenary.push(new Scenary("pop", enemy.x, enemy.y-enemy.img_set.main.height));
                            }else{
                                ScoreBar(100);
                            }
                            enemies.splice(i, 1);
                        }else{
                            //apply a small buffer to stop irritated players
                                //2.got got
                                HpBar("hit");
                            
                        }
                    }
                }
            });
        }
        //fireballs
        if(fireballs.length > 0){
            //player.img_set.current = player.img_set.kick;
            $(enemies).each(function(i, enemy){
                if(hitTestObject(fireballs[0], enemy)){
                    ScoreBar(250);
                    world_scenary.push(new Scenary("pop", enemy.x, enemy.y-enemy.img_set.main.height));
                     enemies.splice(i, 1);
                }
            });
        }
        //shells hitting enemies?
        if(shells.length > 0){
            $(shells).each(function(i,shell){
                if(shell.kicked){
                    $(enemies).each(function(i, enemy){
                        if(hitTestObject(enemy, shell)){
                            ScoreBar(100);
                            world_scenary.push(new Scenary("pop", enemy.x, enemy.y));
                             enemies.splice(i, 1);
                        }
                    });
                }
            });
        }
        
    } //end hit tests regardng enemies
    
    //shells
    if(shells.length > 0){
        $(shells).each(function(i,shell){
            if(hitTestObject(player, shell)){
                shell.kicked = true;
                player.Kick("low"); //player.img_set.current.src = "img/kicklow.png"
            }
        });
    }
    //collect coins & mushists
     $(world_scenary).each(function(i,item){
        if(item.type=="coincollect"){
            if(hitTestObject(player, item)){
                ScoreBar(100);
                console.log('hit coin');
                world_scenary.splice(i,1);
            }
        }
        if(item.type=="mushroom"){
            if(hitTestObject(player, item)){
                player.PowerUp();
                world_scenary.splice(i,1);
            }
        }
     });

    


    /////////////////////////
    //                     //
    // CHARACTER ANIMATION //
    //                     //
    /////////////////////////

    if(player.anim_dur<0 && !player.jumping){
        player.punch = false;
        player.kick = false;
		player.jumping = false;
        player.hit = false;
		//reset to main
        
        //alternate the main image to make player 'bounce' or strut
        player.anim_strut--;
        if(player.x_speed < player.anim_strut){
            player.img_set.current.src = "img/player-strut.png";
        }else{
            player.img_set.current.src = "img/player.png";//player.img_set.main;
            if(player.anim_strut==0){
                player.anim_strut = player.x_speed * 6;
            }
        }
    };

    //tweak attack duration
    player.anim_dur --;



    //////////////////////
    //                  //
    //  UPDATE CANVAS   //
    //                  //
    //////////////////////
    

    //draw pipeplant enemies first as they go behind pipes
    //if its a pipeplant, it just goes up n down
    //Draw enemies
    $(enemies).each(function(i, enemy){
        if(enemy.type=="pipeplant"){
            enemy.x = enemy.x - enemy.x_speed;
            enemy.y = enemy.y;
            var enemy_img = enemy.img_set.main;
            if(enemy.anim_strut && enemy.anim_strut_count > enemy.anim_strut/2){
                enemy_img = enemy.img_set.main2;
            }
            if(enemy.y >= world_floor+30){
                enemy.y_dir="up";
            }
            if(enemy.y < world_floor - 60){
                enemy.y_dir="down";
            }
            if(enemy.y_dir=="up"){ 
                enemy.y -= enemy.y_speed;
            }
            if(enemy.y_dir=="down"){ 
                enemy.y +=enemy.y_speed;
            }
            canvas.drawImage(enemy_img, enemy.x , enemy.y);
            //remove if off screen
            RemoveOffscreenItems(enemies, enemy, i);
            //animation for wlak
            enemy.anim_strut_count --;
            if(enemy.anim_strut_count==0){enemy.anim_strut_count = enemy.anim_strut}
        }
    });
    //Draw scenary - platforms, clouds etc
    $(world_scenary).each(function(i, item){
        //remove the scenary if it has expired - if its timer reached 1
        var item_expired=false;
        if(item.expires){
            item.expire_time--;
            if(item.expire_time==2){
                //console.log('remove it '+item.type+' - expired. time: '+item.expire_time+' arr:'+world_scenary.length);
                world_scenary.splice(i,1);
                item.expired=true;
            }
        }
        if(!item_expired){
            canvas.drawImage(item.img_set.main, item.x , item.y);
        }
    });

    //Draw enemies
    $(enemies).each(function(i, enemy){
        if(enemy.type!="pipeplant"){
            enemy.x = enemy.x - enemy.x_speed;
            enemy.y = enemy.y;
            var enemy_img = enemy.img_set.main;
            if(enemy.anim_strut && enemy.anim_strut_count > enemy.anim_strut/2){
                enemy_img = enemy.img_set.main2;
            }
            //if enemy is a flying koopa, bounce him along
            if(enemy.type=="koopawing"){
                if(enemy.y >= world_floor+20){
                    enemy.y_dir="up";
                }
                if(enemy.y < 50){
                    enemy.y_dir="down";
                }
                if(enemy.y_dir=="up"){ 
                    enemy.y -=2
                    if(enemy.y < 120){enemy.y -=1; enemy.x = enemy.x - enemy.x_speed/2;}
                }
                if(enemy.y_dir=="down"){ 
                    enemy.y +=2;
                    if(enemy.y < 130){enemy.y -=1; enemy.x = enemy.x - enemy.x_speed/2;}
                }
            }
            //if enemy is an angry fisher, makehim chase mario and chuck shells for a certain time
            if(enemy.type=="fishing" && enemy.fishing_hit){
                //move cloud man to the right, then back left
                console.log('fish x '+enemy.x)
                if(enemy.x_dir=="right"){enemy.x=enemy.x+1.5;} else{enemy.x -= enemy.x_speed/4}
                if(enemy.x>480){ enemy.x_dir="left"}
               
                //create shel land drop to earth
                if(enemy.fishing_new_shell_dur == 0){
                    if(enemy.fishing_shell_dir=="left"){enemy.fishing_shell_dir="right"} else { enemy.fishing_shell_dir="left"}
                    enemies.push(new Enemy("fishingshell", enemy.x, enemy.y, enemy.fishing_shell_dir));
                    enemy.fishing_new_shell_dur = enemy.fishing_new_shell_dur_base;
                }
                enemy.fishing_new_shell_dur --;
            }
            //move shells to earth
            if(enemy.type=="fishingshell"){
                if(enemy.y < world_floor+60){
                    enemy.y += 1.8;
                }
                else{
                    if(enemy.x_dir == "left"){
                     enemy.x -= enemy.x_speed;
                    }else{
                        enemy.x += enemy.x_speed*2;
                    }
                }

            }
            

            canvas.drawImage(enemy_img, enemy.x , enemy.y);
            //remove if off screen
            RemoveOffscreenItems(enemies, enemy, i);
            //animation for wlak
            enemy.anim_strut_count --;
            if(enemy.anim_strut_count==0){enemy.anim_strut_count = enemy.anim_strut}
        }
    });
    //Draw shells
    $(shells).each(function(i,shell){
        //if shell has been kicked, send it acking
        if(shell.kicked){
            shell.x += shell_speed;
        }
        canvas.drawImage(shell.img_set.main, shell.x, shell.y);
        //remove if off screen
        RemoveOffscreenItems(shells, shell, i);
    });
    //any fireballs
    $(fireballs).each(function(i, fireball){
        fireball.x = fireball.x + fireball_speed;
        fireball.y = fireball.y;
        canvas.drawImage(fireball.img_set.main, fireball.x , fireball.y);
        //remove if off screen
        RemoveOffscreenItems(fireballs, fireball, i);
    });

    //Draw the player
    canvas.drawImage(player.img_set.current, player.x, player.y);
    
    canvas.restore();
   
} 
 
function toggleGameplay()
{
    gameRunning = !gameRunning;
    if(gameRunning)
    {
        clearInterval(gameloopId);
        gameloopId = setInterval(gameLoop, 10);
    }
    else
    {
        clearInterval(gameloopId);
    }
}



//////////////////////
//                  //
//   GAME OBJECTS   //
//                  //
//////////////////////

function Enemy(type, x_pos, y_pos, x_dir){
    this.type = type;
    if (!x_pos){ x_pos = 500}
    if (!y_pos){ y_pos = world_floor+33}
    if (!x_dir){ x_dir = "left"}
    this.x = x_pos;
    this.y = y_pos;
    this.y_dir=false;
    this.x_dir= x_dir;
    this.x_speed = 0.9;
    this.y_speed=2;
    this.anim_strut = 20;
    this.anim_strut_count = this.anim_strut;
    this.img_set = new Object();
    this.img_set.main = new Image();
    this.img_set.main.src = "img/enemies/"+type+".png";
    this.img_set.main2 = new Image();
    this.img_set.main2.src = "img/enemies/"+type+"2.png"; 
    //method to remove enemy
    this.Remove = function(){
        console.log('remove me ');
        //if koopa, offer a shell to the murderer
        if(this.type=="koopa"){
        console.log('CREATE SHELL AT x'+this.x);
            var shell = new Shell(this.x, this.y-10);
            
            shells.push(shell);
        }
        enemies.splice(this,1);
    }
    if(type=="bullet"){
        this.img_set.main.src="img/enemies/bullet.png";
        this.img_set.main2.src="img/enemies/bullet.png";
        this.x_speed = 3;
    }
    if(type=="koopawing"){
        this.x_speed = 0.7;
        this.y_dir="up";
        this.img_set.main.src="img/enemies/koopawing.png";
        this.img_set.main2.src="img/enemies/koopawing2.png";
    }
    if(type=="pipeplant"){
        this.x_speed =0;
        this.y_speed=0.4;
        this.anim_strut = 40;
        this.img_set.main.src="img/enemies/pipeplant.png";
        this.img_set.main2.src="img/enemies/pipeplant2.png";
    }
    if(type=="footballer"){
        this.x_speed =4;
        this.anim_strut = 20;
        this.img_set.main.src="img/enemies/football.png";
        this.img_set.main2.src="img/enemies/football2.png";
    }
    if(type=="fishing"){
        this.x_speed =1;
        this.y=50;
        this.fishing_hit=false;
        this.anim_strut = 20;
        this.fishing_shell_dir = "left";
        this.fishing_new_shell_dur_base = 100;
        this.fishing_new_shell_dur = this.fishing_new_shell_dur_base;
        this.img_set.main.src="img/enemies/fishing.png";
        this.img_set.main2.src="img/enemies/fishing2.png";
    }
    if(type=="fishingshell"){
        this.x_speed = 0.3;
        this.y=30;
        this.img_set.main.src="img/enemies/fishingshell.png";
        this.img_set.main2.src="img/enemies/fishingshell2.png";
    }
}

function Shell(x_pos,y_pos){
    this.x=x_pos;
    this.y=y_pos+38;
    this.img_set = new Object();
    this.img_set.main = new Image();
    this.img_set.main.src="img/enemies/shell.png";
    this.kicked = false;
}

function Scenary(type,x_pos,y_pos){
    this.x=x_pos;
    this.y=y_pos+38;
    this.type=type;
    this.img_set = new Object();
    this.img_set.main = new Image();
    this.can_land_on=false;
    this.can_walk_through=true;
    this.is_hittable=false;
    this.expires = false;
    this.expire_time =false;
    this.RemoveItem = function(){
        world_scenary.splice(this,1);
        console.log('REMOVE SCEN'+this.type);
    }
    //set up special attrs for some
    if(type=="platform"){
        this.can_land_on=true;
        this.img_set.main.src="img/bg/platform.png";
    }
    if(type=="pipe"){
        this.can_land_on=true;
        this.img_set.main.src="img/bg/pipe.png";
        this.can_walk_through=false;
    }
    if(type=="bush"){
        this.img_set.main.src="img/bg/bush.png";
    }
    if(type=="coinbox"){
        this.img_set.main.src="img/items/coinbox.png";
        this.is_hittable=true;
        this.can_land_on=true;
        this.has_item=true;
        this.can_walk_through=false;
    }
    if(type=="coin"){
        this.img_set.main.src="img/items/coin.png";
        this.expires=true;
        this.expire_time=15;
    }
    if(type=="coincollect"){
        this.img_set.main.src="img/items/coin.png";
    }
    if(type=="mushroom"){
        this.img_set.main.src="img/items/mushroom.png";
    }
    if(type=="pop"){
        this.img_set.main.src="img/enemies/pop.png";
        this.expires=true;
        this.expire_time=30;
    }
    //one-pff scenary items
    if(type=="mbison"){
        this.img_set.main.src="img/enemies/mbison.png";
    }
    if(type=="startarrow"){
        this.img_set.main.src="img/bg/startarrow.png";
    }
    if(type=="end"){
        this.img_set.main.src="img/bg/end.png";
    }
}

//create a new enemy and add to enemy array. this is added to canvas in frame reset
function AddEnemy(type){
    var new_enemy = new Enemy(type);
    enemies.push(new_enemy);
    console.log('Added enemy: '+type);
}



//////////////////////
//                  //
//     UI STUFF     //
//                  //
//////////////////////

function HpBar(event){
    var new_hp_pc;
    if(event=="hit"){
        player.hp -= 50;
        new_hp_pc = player.hp +'%';
        //set brief moment of invulnerability
        player.Hit();
    }
    if(event=="powerup"){
        player.hp += 50;
        new_hp_pc = player.hp +'%';
    }
    //knocked out?
    if(player.hp <= 0 ){
        player.Knockout();
    }
    $("#hp-bar-hit").css('width', new_hp_pc);
}

function ScoreBar(points){
    var current_score = $('#score span').text()
    var new_score = parseInt($('#score span').text()) + points;
        console.log('currnet'+current_score+', new'+new_score);

    $("#score span").text(new_score);
}



//////////////////////
//                  //
//  SPECIAL MOVES   //
//                  //
//////////////////////

function ExecuteSpecialMoves(){

    //hadoken
    if(player.hadoken && player.hadoken_dur >= 0){
        player.img_set.current.src = "img/hadokenpunch.png";
        player.hadoken_dur--;
        if(player.hadoken_dur == 0){ player.hadoken = false; }

    }
    //tetsu
    if(player.tetsu && player.tetsu_dur >= 0){
       
         var img_no = Math.round(player.tetsu_dur / 10);
         player.img_set.current.src = "img/tetsu/tetsu"+img_no+".png"; 
         player.tetsu_dur --;
            //x movement done by scrolling bg
         if(player.tetsu_dur > (player.tetsu_dur_base/2)){ //up
            player.y -=2;
         }else{ //back down
            player.y +=2;
            //see if landed on anything good like a platform
            if(LandOnPlatform()){
                console.log('landed on platform from tetsu');
                player.tetsu_dur=0;
            }
         }
         if (player.tetsu_dur == 0){ player.tetsu = false; player.y = world_floor;}
    }
    //dragon
    if(player.dragon && player.dragon_dur >= 0){
        var img_no = Math.round(player.dragon_dur / 10);
         player.img_set.current.src = "img/dragon/dragon"+img_no+".png"; 
         player.dragon_dur --;
         console.log(img_no);
        //x movement done by scrolling bg
        if(player.dragon_dur > (player.dragon_dur_base/2)){
            player.y -=6;
         }else{
            if(player.y < world_floor - 20){ player.y +=6; }
         }
         if (player.dragon_dur == 0){ 
            player.dragon = false;  
            player.img_set.current.src = "img/player.png";
            player.y = world_floor;
         }
    }
}



//////////////////////
//                  //
//   HITTEST,JUMPS  //
//                  //
//////////////////////

function hitTestObject(obj1, obj2){
    //hit test performed on the image which is stored in a parent item that has the x/y  
    //eg player, we get obj1.x for left;right would be obj1.x + obj1.img_set.main.width
    obj1.bounds = new Object();
    obj1.bounds.top = obj1.y;
    obj1.bounds.right = obj1.x + obj1.img_set.main.width;
    obj1.bounds.left = obj1.x;
    obj1.bounds.bottom = obj1.y + obj1.img_set.main.height;
    obj1.bounds.center = obj1.bounds.top + (obj1.img_set.main.height/2)
    //console.log('obj1 BOUNDS:'+obj1.bounds.top + ' '+obj1.bounds.right + ' '+obj1.bounds.bottom + ' '+obj1.bounds.left);
    obj2.bounds = new Object();
    obj2.bounds.top = obj2.y;
    obj2.bounds.right = obj2.x + obj2.img_set.main.width;
    obj2.bounds.left = obj2.x;
    obj2.bounds.bottom = obj2.y + obj2.img_set.main.height;
    //console.log('obj2 BOUNDS:'+obj2.bounds.top + ' '+obj2.bounds.right + ' '+obj2.bounds.bottom + ' '+obj2.bounds.left);
    return (!(obj1.bounds.right < obj2.bounds.left ||
        obj1.bounds.left > obj2.bounds.right ||
        obj1.bounds.bottom < obj2.bounds.top ||
        obj1.bounds.top > obj2.bounds.bottom));
}

function LandOnPlatform(){
    //see if player landed on a platform
    //if jumping down and hit test top of platform
    var landed = false;
    $(world_scenary).each(function(i, item){
        //check hit status for a land on all 'landable' scenary
        if(item.can_land_on){
            //do hit test for it, return true if so
            var player_foot = player.y+player.img_set.main.height;
            var plat_top = item.y;                
            if(player_foot < plat_top+5){
                if(hitTestObject(player, item)){
                    landed = true;
                    console.log('landed;')
                }
          }
        }
    });
    //set landed as an attr of player obj for checking
    player.is_on_platform = landed;
    return landed;
}



//////////////////////
//                  //
//  SCREEN SCROLL   //
//                  //
//////////////////////

function ScrollScreen(){
    //moves the screen right if the player is past halfway
    if( ((player.x >= (screenWidth/2-50)) && (player.walking)) || player.tetsu || player.dragon){
        this.ShiftRight();
    }
    
    //gone too far left
    if(player.x <= player.img_set.main.width/4 && player.walking){
        //var new_left = $(world_window).position().left + (speed_x); //('left');
        //$(world_window).css('left', new_left);
        world_left_side_reached = true;
    }
    this.ShiftRight = function(){
        var new_left = ($(world_window).position().left - (speed_x*3)); //('left');
        $('#world-bg').css('left', new_left);
        if(!player.tetsu && !player.dragon){
            world_right_side_reached = true;
        }
        player.x -= (speed_x*3);
        
        //move static items along with scrolling bg
        $(shells).each(function(i,shell){
            if(!shell.kicked){shell.x -= (speed_x/1.3)};
        });
        $(world_scenary).each(function(i,item){
            item.x -= (speed_x/1.3);
        });
        $(enemies).each(function(i,enemy){
            enemy.x -= (speed_x/1.3);
        });

        //add enemies - if current x of scroll matches an x in the enemy layout
        //coords = enemy-type, x, y
        $(world_layout['enemies']).each(function(i, coords){
            if( ((new_left*-2)+100) > coords[1]){
                    console.log('ADD ENEMY FROM ARRAY)');
                    enemies.push(new Enemy(coords[0], 544, world_floor+33));
                    //remove this item form the array to stop more being added
                    world_layout['enemies'].splice(i,1);
            }
        });
    }
    
}

function RemoveOffscreenItems(array, item, index){
    //see if item is offscreen (plus a buffer). if so remove.
    if(item.x < -30 || item.x > (screenWidth + 200)){
        array.splice(index,1);
        console.log('Rmove offscreen item');
    }
}





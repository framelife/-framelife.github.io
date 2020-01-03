window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( -2,1,-2 ), Vec.of( 0,0.8,-0.6 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );
        const shapes = { wall:   new My_Square(),                         
                         myBox: new Cube(),
                         myTube: new Rounded_Capped_Cylinder (20,20,[[0,1],[0,1]]), 
                         on_fire: new Little_Square(),
                         shadow: new Subdivision_Sphere(4),
                         fireCircle: new Torus(36,36),
                         scoreBroad: new Square(),
                         test: new ironBall,
                         headtail: new Closed_Cone(12,12)
                                                 
                       }
        
       
        this.submit_shapes( context, shapes );        
        this.materials =
          { phong: context.get_instance( Phong_Shader ).material( Color.of( 0.9,0.3,0.6,1 ), {ambient:0.5, diffusivity: 1, specularity: 1, smooth:40 } ),
            phong2: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient:1, diffusivity: 0, specularity: 0, smooth:40 } ),
            picture_B: context.get_instance(Texture_B).material(Color.of(0,0,0,1), 
                       {ambient:0,specularity:1, texture: context.get_instance("assets/f1.jpg"), texture2: context.get_instance("assets/f2.jpg")}),
            picture_T: context.get_instance(Texture_T).material(Color.of(0,0,0,1), 
                       {ambient:0,specularity:1, texture: context.get_instance("assets/tent.png"), texture2: context.get_instance("assets/tent normal.png")}),
            picture_R: context.get_instance(Texture_R).material(Color.of(0,0,0,1), 
                       {ambient:0,specularity:1, texture: context.get_instance("assets/try1.png"), texture2: context.get_instance("assets/try1 normal.png")}),
            picture_L: context.get_instance(Texture_L).material(Color.of(0,0,0,1), 
                       {ambient:0,specularity:1, texture: context.get_instance("assets/try1.png"), texture2: context.get_instance("assets/try1 normal.png")}),
            picture_S: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/start.png")}),
            picture_E: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/end.png")}),
            fire_skin: context.get_instance( Fire_Shader ).material(),
            fire_2skin: context.get_instance( Fire_2Shader ).material(),
            picture_score0: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score0.png")}),
            picture_score1: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score1.png")}),
            picture_score2: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score2.png")}),
            picture_score3: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score3.png")}),
            picture_score4: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score4.png")}),
            picture_score5: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score5.png")}),
            picture_score6: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score6.png")}),
            picture_score7: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score7.png")}),
            picture_score8: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score8.png")}),
            picture_score9: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), 
                       {ambient:1,specularity:1, texture: context.get_instance("assets/score9.png")})
            
            
            
          }      
        this.v = 0;
        this.h = 0;
        this.g = -6;        
        this.x = 0;
        this.vx = 1.5; 
        this.rate =4;  
        this.hit_flag = 9; 
        this.start_flag = 0;
        this.hit_o = -1;
        this.totalScore =0;
        this.score_o =-1;
        this.timeplay=0;
        this.sounds = {run:new Audio('assets/bgm.mp3'),
                       fail:new Audio('assets/failure.mp3'),
                       jump:new Audio('assets/jump.mp3'),
                       score:new Audio('assets/score.mp3')};
                
      }
    make_control_panel()
      { 
        this.key_triggered_button( "jump",     [ "x" ], () => {this.j_flag =2;} );
        this.key_triggered_button( "change",     [ "c" ], () => {if(this.h==0){this.vx *= -1;}} );  
        this.key_triggered_button( "start",     [ "g" ], () => {this.hit_flag = -1; } );      
      }
    drawFireCircle(graphics_state, x,y,z){
      let fireCircle_transform = Mat4.identity().times(Mat4.translation([x,(y-1)/2,z]))
                                            .times(Mat4.rotation(Math.PI/2,[1,0,0]))
                                            .times(Mat4.scale([0.05,0.05,(y-1)]));
      this.shapes.myTube.draw(graphics_state,fireCircle_transform,this.materials.phong);
      fireCircle_transform = Mat4.identity().times(Mat4.translation([x,0.03,z]))
                                            .times(Mat4.rotation(Math.PI/2,[1,0,0]))
                                            .times(Mat4.scale([0.36,0.36,0.06]));
      this.shapes.myTube.draw(graphics_state,fireCircle_transform,this.materials.phong);
      fireCircle_transform = Mat4.identity().times(Mat4.translation([x,y,z])).times(Mat4.scale([1*Math.min((35+z)/10,1),1*Math.min((35+z)/10,1),0.5]));
      this.shapes.fireCircle.draw(graphics_state,fireCircle_transform,this.materials.fire_skin);
      
      
      
      
    }

    play_sound( name, volume = 1 )
         { //if( 0 < this.sounds[ name ].currentTime && this.sounds[ name ].currentTime < 200 ) return;
             //this.sounds[ name ].currentTime = 0;
             this.sounds[ name ].volume = Math.min(Math.max(volume, 0), 1);;
             this.sounds[ name ].play();
         }
    stop_sound( name, volume = 1 )
         { //if( 0 < this.sounds[ name ].currentTime && this.sounds[ name ].currentTime < 200 ) return;
             //this.sounds[ name ].currentTime = 0;
             this.sounds[ name ].volume = Math.min(Math.max(volume, 0), 1);;
             this.sounds[ name ].pause();
         }
    drawGuy(graphics_state, x,y,z){
      var t = (graphics_state.animation_time / 1000);
      t =12* t%(2*Math.PI);
      var tall=0.8; 
      if(y>tall/2 && this.j_flag >=1){
          t=-3*Math.PI/4;
      }
      let head_transform = Mat4.identity().times(Mat4.translation([x,y+0.25*tall-0.04*tall*Math.cos(2*t),0]))
                                          .times(Mat4.rotation(Math.cos(t)*0.08,[0,0,1]))
                                          .times(Mat4.rotation(Math.cos(t)*0.04,[0,-1,0]))
                                          .times(Mat4.scale([0.25*tall,0.25*tall,0.25*tall]));
      this.shapes.myBox.draw(graphics_state,head_transform,this.materials.phong.override({color: Color.of(1, 1, 1, 1)}));
      let body_transform = Mat4.identity().times(Mat4.translation([x,y-0.175*tall-0.03*tall*Math.cos(2*t),0]))
                                          .times(Mat4.rotation(-0.2*Math.cos(t+Math.PI),[0,-1,0]))
                                          .times(Mat4.scale([0.125*tall,0.125*tall,0.125*tall]));
      this.shapes.myBox.draw(graphics_state,body_transform,this.materials.phong.override({color: Color.of(1, 0, 0, 1)}));
      let right_hand_transform = Mat4.identity().times(Mat4.translation([x+0.2*tall,y-0.175*tall,-0.1*tall*Math.cos(t)]))
                                                .times(Mat4.rotation(-Math.cos(t)*Math.PI/8,[1,0,0]))
                                                .times(Mat4.scale([0.06*tall,0.06*tall,0.06*tall]));
      this.shapes.myBox.draw(graphics_state,right_hand_transform,this.materials.phong.override({color: Color.of(0, 0, 1, 1)}));
      let left_hand_transform = Mat4.identity().times(Mat4.translation([x-0.2*tall,y-0.175*tall,-0.1*tall*Math.cos(t+Math.PI)]))
                                               .times(Mat4.rotation(-Math.cos(t+Math.PI)*Math.PI/8,[1,0,0]))
                                               .times(Mat4.scale([0.06*tall,0.06*tall,0.06*tall]));
      this.shapes.myBox.draw(graphics_state,left_hand_transform,this.materials.phong.override({color: Color.of(0, 0, 1, 1)}));
      let right_leg_transform = Mat4.identity();
      let left_leg_transform = Mat4.identity();
      if(t<Math.PI){
          right_leg_transform = right_leg_transform.times(Mat4.translation([x+0.21*tall,y-0.44*tall+Math.max(0.1*tall*Math.sin(t),0),0.1*tall*Math.cos(t)]))
                                                   .times(Mat4.rotation(Math.cos(t*2+Math.PI/2)*Math.PI/4,[1,0,0]))
                                                   .times(Mat4.scale([0.075*tall,0.06*tall,0.125*tall]));
          left_leg_transform = left_leg_transform.times(Mat4.translation([x-0.21*tall,y-0.44*tall+Math.max(0.1*tall*Math.sin(t+Math.PI),0),0.1*tall*Math.cos(t+Math.PI)]))
                                              .times(Mat4.scale([0.085*tall,0.06*tall,0.125*tall]));
      }
      else{
          right_leg_transform = right_leg_transform.times(Mat4.translation([x+0.21*tall,y-0.44*tall+Math.max(0.1*tall*Math.sin(t),0),0.1*tall*Math.cos(t)]))
                                                   .times(Mat4.scale([0.075*tall,0.06*tall,0.125*tall]));
          left_leg_transform = left_leg_transform.times(Mat4.translation([x-0.21*tall,y-0.44*tall+Math.max(0.1*tall*Math.sin(t+Math.PI),0),0.1*tall*Math.cos(t+Math.PI)]))
                                                 .times(Mat4.rotation(Math.cos(t*2+Math.PI/2)*Math.PI/4,[1,0,0]))
                                                 .times(Mat4.scale([0.085*tall,0.06*tall,0.125*tall]));
      }
      this.shapes.myBox.draw(graphics_state,right_leg_transform,this.materials.phong.override({color: Color.of(0, 0, 1, 1)}));
      this.shapes.myBox.draw(graphics_state,left_leg_transform,this.materials.phong.override({color: Color.of(0, 0, 1, 1)}));
      this.shapes.shadow.draw(graphics_state,Mat4.identity().times(Mat4.translation([this.x,0,0.16])).times(Mat4.scale([0.2*0.4/y,0.01,0.2*0.4/y]))
                                                            .times(Mat4.rotation(3*t,Vec.of(-1.5,0,-this.vx))),this.materials.phong2);
         
    }
    drawWall(graphics_state, long){
      var i,j;      
        for(i=-2;i<=2;i+=4){
          for(j=-long;j<=4;j+=4){
            this.shapes.wall.draw(graphics_state,Mat4.identity().times(Mat4.translation([i,0,j])).times(Mat4.rotation(Math.PI/2,[-1,0,0])),this.materials.picture_B);
            this.shapes.wall.draw(graphics_state,Mat4.identity().times(Mat4.translation([i,4,j])).times(Mat4.rotation(Math.PI/2,[1,0,0])),this.materials.picture_T);
          }
        }
        var i,j;
        for(i=2;i<=2;i+=4){
          for(j=-long;j<=4;j+=4){
            this.shapes.wall.draw(graphics_state,Mat4.identity().times(Mat4.translation([-4,i,j])).times(Mat4.rotation(Math.PI/2,[0,1,0])),this.materials.picture_L);
            this.shapes.wall.draw(graphics_state,Mat4.identity().times(Mat4.translation([4,i,j])).times(Mat4.rotation(Math.PI/2,[0,-1,0])),this.materials.picture_R);
          }
        }
    }
    

    checkIfHit(graphics_state,cx,cy,ox,oy){
      var dist=[];      
      var result = 0;
      dist[0] = Math.pow(cx-0.2-ox,2)+Math.pow(cy+0.4-oy,2);
      dist[1] = Math.pow(cx+0.2-ox,2)+Math.pow(cy+0.4-oy,2);
      dist[2] = Math.pow(cx-0.2-ox,2)+Math.pow(cy-0.4-oy,2);
      dist[3] = Math.pow(cx+0.2-ox,2)+Math.pow(cy-0.4-oy,2);
      var i;
      for(i=0;i<4;i++){
        if(dist[i]<0.64){
          result++;
        }
        else if(dist[i]>1.56){
          result--;
        }
      }
      
      return result;
    }
    checkOBHIT(graphics_state,cx,cy,ox,oy){
        var result1 = 0;
        if(Math.pow(cx-0.2-ox,2)+Math.pow(cy+0.4-oy,2)<0.49){
            result1 =1;
        }
        else if(Math.pow(cx+0.2-ox,2)+Math.pow(cy+0.4-oy,2)<0.5){
            result1 =1;
        }
        else if(Math.pow(cx-0.2-ox,2)+Math.pow(cy-0.4-oy,2)<0.5){
            result1 =1;
        }
        else if(Math.pow(cx+0.2-ox,2)+Math.pow(cy-0.4-oy,2)<0.5){
            result1 =1;
        }
       return result1;
    }
    showScore(graphics_state,ones,tens){
      switch(ones){
            case 0:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score0);
              break;
            case 1:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score1);
              break;
            case 2:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score2);
              break;
            case 3:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score3);
              break;
            case 4:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score4);
              break;
            case 5:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score5);
              break;
            case 6:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score6);
              break;
            case 7:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score7);
              break;
            case 8:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score8);
              break;
            case 9:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.45,-0.90]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score9);
              break;
            default:
          }
          switch(tens){
            case 0:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.5,-1.26]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score0);
              break;
            case 1:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.5,-1.26]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score1);
              break;
            case 2:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.5,-1.26]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score2);
              break;
            case 3:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.5,-1.26]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score3);
              break;
            case 4:
              this.shapes.scoreBroad.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0.5,-1.26]))
                                                                  .times(Mat4.rotation(3*Math.PI/5,[0,-1,0]))
                                                                  .times(Mat4.scale([0.15,0.15,1])),this.materials.picture_score4);
              break;
            default:

          }
          
    }
    drawBall(graphics_state,x,y,z){
        const t = graphics_state.animation_time / 1000;
        var move = Math.sin(4*t);
        this.shapes.shadow.draw(graphics_state,Mat4.identity().times(Mat4.translation([x,y,z]))
                                                              .times(Mat4.scale([0.5,0.5,0.5])),this.materials.phong.override({color: Color.of(0, 0, 1, 1)}));
        this.shapes.test.draw(graphics_state,Mat4.identity().times(Mat4.translation([x,y,z]))
                                                            .times(Mat4.scale([0.58+0.05*move,0.58+0.05*move,0.58+0.05*move])).times(Mat4.scale([1.2,1.2,1.2]))
                                                            .times(Mat4.rotation(t,[0,-1,0])),this.materials.phong);
    }

    display( graphics_state )
      { 
       
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        this.myLight = [];
        if(this.hit_flag==0 || this.hit_flag==1){ 
            this.play_sound( "run" );
            //this.drawBall(graphics_state,0,1.5,-40+this.rate*t);
            //this.shapes.test.draw(graphics_state,Mat4.identity(),this.materials.phong);        
            var moveH = Math.sin(t);
            var moveV = 0.5*Math.sin(2*t);
            this.fireCircle_pos = [[0,2,-35+this.rate*t],[2,2,-55+this.rate*t],[0+moveH,2,-75+this.rate*t],[-2,2,-95+this.rate*t],
                                  [0,2,-115+this.rate*t],[2,2,-135+this.rate*t],[-1.5,2,-155+this.rate*t],[1.5,2,-175+this.rate*t],[-2,2,-195+this.rate*t],
                                  [0,2,-215+this.rate*t],[-1.5,2,-235+this.rate*t],[0,2,-255+this.rate*t],[2,2,-275+this.rate*t],[-2,2,-295+this.rate*t],
                                  [-1.5,2,-315+this.rate*t],[2,2,-335+this.rate*t],[1.5,2,-355+this.rate*t],[-2,2,-375+this.rate*t],[0,2,-395+this.rate*t],
                                  [2,2,-415+this.rate*t],[1.5,2,-435+this.rate*t],[-2,2,-455+this.rate*t],[0,2,-475+this.rate*t],[-1.5,2,-495+this.rate*t],
                                  [1.5,2,-515+this.rate*t],[0,2,-535+this.rate*t],[2,2,-555+this.rate*t],[0,2,-575+this.rate*t],[-1.5,2,-595+this.rate*t],
                                  [2,2,-615+this.rate*t],[-2,2,-635+this.rate*t],[1.5,2,-655+this.rate*t],[0,2,-675+this.rate*t],[-2,2,-695+this.rate*t],
                                  [1.5,2,-715+this.rate*t],[2,2,-735+this.rate*t],[0,2,-755+this.rate*t],[-2,2,-775+this.rate*t],[1.5,2,-795+this.rate*t],
                                  [2,2,-815+this.rate*t],[0,2,-835+this.rate*t],[-1.5,2,-855+this.rate*t],[2,2,-875+this.rate*t],[-2,2,-895+this.rate*t],
                                  [1.5,2,-915+this.rate*t],[0,2,-935+this.rate*t],[2,2,-955+this.rate*t],[1.5,2,-975+this.rate*t],[-2,2,-995+this.rate*t]];
            
            this.OB_pos=[[0+moveH,1.5+moveH,-49+this.rate*t],[2+1.5*moveH,1.5,-65+this.rate*t],[0+moveH,1.5,-85+this.rate*t],[-2-moveH,1.5,-85+this.rate*t],
                        [0+moveH,1.5+moveH,-105+this.rate*t],[2-moveH,1.5+moveH,-105+this.rate*t],[2,1.5,-125+this.rate*t+7*moveH],[-1.5,1.5+moveH,-145+this.rate*t],[1.5+moveH,1.5+moveH,-165+5*moveH+this.rate*t],[-2,1.5,-175+this.rate*t]];
           
           var i,j;
           
           if(t>0.5){
             this.drawWall(graphics_state, 36);
           }
           
        ///
        ///
        
        //jump movement
           this.h += this.v*dt;

           if( this.h<0){
             this.v = 0;
             this.h = 0;
           }
           if( this.j_flag==2 && this.h == 0){
             this.play_sound( "jump" );
             this.v = 4.6;
             this.j_flag = 1;
             
           }
           else if(this.j_flag==1 && this.h == 0){
             this.v = 2;
             this.j_flag = 0;
           }
           
           this.v += this.g*dt;
        //walk movement        
           if(this.h==0){
               this.x+=this.vx*dt;
           }
           else{
               this.x+=this.vx*dt/4;
           }
           if(this.x>=3.5){
               this.vx = -1.5;
           }
           if(this.x<=-3.5){
               this.vx =1.5;
           }
           this.drawGuy(graphics_state,this.x,this.h+0.4,0);
        //set camera_transform
           let desired = Mat4.identity();
           desired = desired.times(Mat4.translation([this.x/2,2,6]));
           desired = Mat4.inverse(desired);
           graphics_state.camera_transform = desired.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
         

         //drawHEALTH
          //let health_trans=Mat4.identity().times(Mat4.translation([3,3,0])).times(Mat4.scale([0.1,0.1,0.1]));
          //this.shapes.wall.draw(graphics_state,health_trans,this.materials.phong);
         //draw OB
         var result1;
          for(i=0;i<=8;i++){
              this.drawBall(graphics_state,this.OB_pos[i][0],this.OB_pos[i][1],this.OB_pos[i][2]);
              if(this.OB_pos[i][2]>=-49 ){ 
                if(Math.abs(this.OB_pos[i][2])<=0.7){
                  result1 = this.checkOBHIT(graphics_state,this.x,this.h+0.4,this.OB_pos[i][0],this.OB_pos[i][1] );
                  if(result1==1){
                      this.hit_flag=3;
                      this.stop_sound( "run" );
                      this.play_sound( "fail" );
                  }
                 }
              }
          }
            
        //draw Fire Circle
           var result;
           for(i=this.fireCircle_pos.length-1,j=0; j<3 && i>=0 ;i--){
              if(this.fireCircle_pos[i][2]>=-35 ){ 
                 if(Math.abs(this.fireCircle_pos[i][2])<=0.3){
                    result = this.checkIfHit(graphics_state,this.x,this.h+0.4,this.fireCircle_pos[i][0],this.fireCircle_pos[i][1] );
                    if( result!=-4 && result!=4 ){
                       if(this.hit_o != i){
                         this.hit_flag+=1;
                         if(this.hit_flag>=2){
                                       this.stop_sound( "run" );
                                       this.play_sound( "fail" );
                         }
                         this.hit_o = i;
                       }                   
                    } 
                    else if(result==4){
                        if(this.score_o !=i){
                            this.totalScore++;
                            this.play_sound( "score" );
                            this.score_o=i;
                        }
                    }
                 }          
                 this.myLight[j] = new Light( Vec.of(this.fireCircle_pos[i][0],this.fireCircle_pos[i][1],this.fireCircle_pos[i][2],1 ), Color.of( 1, 0.5, 0, 1 ), 100 );
                 this.drawFireCircle(graphics_state,this.fireCircle_pos[i][0],this.fireCircle_pos[i][1],this.fireCircle_pos[i][2]);
                 j++;
              }          
           }   
           graphics_state.lights = this.myLight;
           if(this.hit_flag==1){
              this.shapes.on_fire.draw(graphics_state,Mat4.identity().times(Mat4.translation([this.x,this.h+0.8,0.3]))
                                                                 .times(Mat4.scale([0.3,1/2,1/2])),this.materials.fire_2skin);
           }

        }
        else if(this.hit_flag == 9){
           
           let fc_transform;
           this.light_start = [new Light( Vec.of(-2,2,2,1 ), Color.of( 1, 0.5, 0, 1 ), 1000 )];
           graphics_state.lights = this.light_start;
           fc_transform = Mat4.identity().times(Mat4.translation([0,0.6,1.1])).times(Mat4.scale([0.8,0.8,0.01]));
           this.shapes.fireCircle.draw(graphics_state,fc_transform,this.materials.fire_skin);
           
           this.shapes.wall.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.5,1.0,-0.8]))
                                                                  .times(Mat4.rotation(7.5*Math.PI/5,[0,1,0]))
                                                                  .times(Mat4.scale([0.6,0.3,1])),this.materials.picture_S);
           this.drawGuy(graphics_state,0,0.4,0);
           
        }
        else if(this.hit_flag==-1){

          this.play_sound( "run" );
          graphics_state.animation_time = 0;
          this.hit_flag = 0;
          this.totalScore = 0;
          this.timeplay = 0;
          
        } 
        else if(this.hit_flag==3){
           //var t = (graphics_state.animation_time / 1000);
            var t1 =12* t%(2*Math.PI);
            var tall=0.8; 
          if(this.timeplay<6){
              this.timeplay+=dt;
          }
          else
          {
              this.stop_sound( "fail" );
          }
           
          var fire_scale = (5+Math.sin(t))/5;
          let desired2 = Mat4.identity();
          var ones = Math.floor(this.totalScore % 10);
          var tens = Math.floor(this.totalScore/10 % 10);
          desired2 = desired2.times(Mat4.translation([-2,0.8,-2])).times(Mat4.rotation(3.2*Math.PI/5,[0,-1,0]));
          desired2 = Mat4.inverse(desired2);
          graphics_state.camera_transform = desired2.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
          this.light_end = [new Light( Vec.of(-2,2,2,1 ), Color.of( 1, 0.5, 0, 1 ), 1000*fire_scale )];
          graphics_state.lights = this.light_end;
          
          this.shapes.wall.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.5,1,-1.1]))
                                                                  .times(Mat4.rotation(7.5*Math.PI/5,[0,1,0]))
                                                                  .times(Mat4.scale([0.6,0.3,1])),this.materials.picture_E);
          
          //let headtail_trans= Mat4.identity().times(Mat4.translation([0.1,0.8,-0.2])).times(Mat4.rotation(Math.PI/6,Vec.of(1,0,0))).times(Mat4.scale([0.1,0.1,0.1]));
          let headtail_trans= Mat4.identity().times(Mat4.translation([0.1,0.6+0.25*tall-0.04*tall*Math.cos(2*t1),-0.2]))
                                             .times(Mat4.rotation(Math.cos(t1)*0.08,[0,0,1]))
                                             .times(Mat4.rotation(Math.cos(t1)*0.04,[0,-1,0])) 
                                             .times(Mat4.rotation(Math.PI/6,Vec.of(1,0,0)))
                                             .times(Mat4.scale([0.08,0.08,0.08]));
          
          let headtail1_trans= Mat4.identity().times(Mat4.translation([-0.2,0.5+0.25*tall-0.04*tall*Math.cos(2*t1),0]))
                                             .times(Mat4.rotation(Math.cos(t1)*0.08,[0,0,1]))
                                             .times(Mat4.rotation(-1*Math.PI/2+Math.cos(t1)*0.04,[0,-1,0])) 
                                             .times(Mat4.rotation(Math.PI/6,Vec.of(1,0,0)))
                                             .times(Mat4.scale([0.08,0.08,0.08]));
          

          this.shapes.headtail.draw(graphics_state,headtail_trans,this.materials.phong);
          this.shapes.headtail.draw(graphics_state,headtail1_trans,this.materials.phong);
          this.showScore(graphics_state,ones,tens);
          this.drawGuy(graphics_state,0,0.4,0);
          //this.totalScore =0;
          
          

        }     
        else {
          if(this.timeplay<6){
              this.timeplay+=dt;
          }
          else
          {
              this.stop_sound( "fail" );
          }
          var fire_scale = (5+Math.sin(t))/5;
          let desired2 = Mat4.identity();
          var ones = Math.floor(this.totalScore % 10);
          var tens = Math.floor(this.totalScore/10 % 10);
          desired2 = desired2.times(Mat4.translation([-2,0.8,-2])).times(Mat4.rotation(3.2*Math.PI/5,[0,-1,0]));
          desired2 = Mat4.inverse(desired2);
          graphics_state.camera_transform = desired2.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
          this.light_end = [new Light( Vec.of(-2,2,2,1 ), Color.of( 1, 0.5, 0, 1 ), 100000*fire_scale )];
          graphics_state.lights = this.light_end;
          this.shapes.on_fire.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.1,0,0.3]))
                                                                 .times(Mat4.scale([1.6*fire_scale,1.9*fire_scale,1.9*fire_scale])),this.materials.fire_2skin);
          this.shapes.wall.draw(graphics_state,Mat4.identity().times(Mat4.translation([0.5,1,-1.1]))
                                                                  .times(Mat4.rotation(7.5*Math.PI/5,[0,1,0]))
                                                                  .times(Mat4.scale([0.6,0.3,1])),this.materials.picture_E);
          
          
          this.showScore(graphics_state,ones,tens);
          this.drawGuy(graphics_state,0,0.4,0);
          //this.totalScore =0;
          
          

        }                   
      }
  }

class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {      
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec2 tex_coord_new = vec2(f_tex_coord.x , f_tex_coord.y- animation_time);
          vec4 tex_color = texture2D( texture, tex_coord_new );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec2 tex_coord_new = f_tex_coord.xy;
          mat2 little_mat = mat2(cos(1.5708*animation_time),sin(1.5708*animation_time),-sin(1.5708*animation_time),cos(1.5708*animation_time));
          tex_coord_new = tex_coord_new-0.5;
          tex_coord_new = little_mat*tex_coord_new;
          tex_coord_new = tex_coord_new+0.5;
          vec4 tex_color = texture2D( texture, tex_coord_new );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

window.Torus = window.classes.Torus =
class Torus extends Shape                                       // Build a donut shape.  An example of a surface of revolution.
  { constructor( rows, columns )  
      { super( "positions", "normals", "texture_coords" );
        const circle_points = Array( rows ).fill( Vec.of( .3,0,0 ) )
                                           .map( (p,i,a) => Mat4.translation([ -1.0,0,0 ])
                                                    .times( Mat4.rotation( i/(a.length-1) * 2*Math.PI, Vec.of( 0,-1,0 ) ) )
                                                    .times( p.to4(1) ).to3() );
        Surface_Of_Revolution.insert_transformed_copy_into( this, [ rows, columns, circle_points ] );         
      } 
  }


window.MyShape = window.classes.MyShape =
class MyShape extends Shape                                       // Build a donut shape.  An example of a surface of revolution.
  { constructor()
    { super( "positions", "normals", "texture_coords" );
      var stack = [];   
      Subdivision_Sphere.insert_transformed_copy_into( this, [ 3 ], Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ).times( Mat4.scale([ .2, .2, .2 ]) ) );
      var i;
      for(i=0;i<10;i++) {
        Torus.insert_transformed_copy_into( this, [ 16,16 ], Mat4.rotation(2*Math.PI/10*i,Vec.of(0,0,1))
                                                      .times(Mat4.translation([0.5,0,0]).times(Mat4.rotation(1,Vec.of(1,0,0)))) ) ;
      }
    }
  }

window.ironBall = window.classes.ironBall =
class ironBall extends Shape                                       // Build a donut shape.  An example of a surface of revolution.
  { constructor()
    { super( "positions", "normals", "texture_coords" );
      var stack = []; 
      let ironBall_tranform = Mat4.identity().times(Mat4.scale([0.4,0.4,0.4])) ;
      //Subdivision_Sphere.insert_transformed_copy_into( this, [ 4 ], ironBall_tranform );
      var i;
      for(i=0;i<12;i++){
          ironBall_tranform = Mat4.identity().times(Mat4.rotation(2*Math.PI/12*i,[1,0,0]))
                                             .times(Mat4.translation([0,0,0.6])).times(Mat4.scale([0.2,0.2,0.2]))
          Closed_Cone.insert_transformed_copy_into( this, [ 4, 10,[[  0 ,1 ], [ 0,1 ]] ], ironBall_tranform );
      }
      for(i=0;i<8;i++){
          ironBall_tranform = Mat4.identity().times(Mat4.rotation(2*Math.PI/8*i,[1,0,0]))
                                             .times(Mat4.rotation(Math.PI/6,[0,1,0]))
                                             .times(Mat4.translation([0,0,0.6])).times(Mat4.scale([0.2,0.2,0.2]))
          Closed_Cone.insert_transformed_copy_into( this, [ 4, 10,[[  0 ,1 ], [ 0,1 ]] ], ironBall_tranform );
      }
      for(i=0;i<4;i++){
          ironBall_tranform = Mat4.identity().times(Mat4.rotation(2*Math.PI/4*i,[1,0,0]))
                                             .times(Mat4.rotation(Math.PI/3,[0,1,0]))
                                             .times(Mat4.translation([0,0,0.6])).times(Mat4.scale([0.2,0.2,0.2]));
          Closed_Cone.insert_transformed_copy_into( this, [ 4, 10,[[  0 ,1 ], [ 0,1 ]] ], ironBall_tranform );
          
      }
      for(i=0;i<1;i++){
          ironBall_tranform = Mat4.identity().times(Mat4.translation([0,0,0]))//.times(Mat4.rotation(2*Math.PI/4*i,[1,0,0]))
                                                                  .times(Mat4.rotation(Math.PI/2,[0,1,0]))
                                                                  .times(Mat4.translation([0,0,0.6])).times(Mat4.scale([0.2,0.2,0.2]))
          Closed_Cone.insert_transformed_copy_into( this, [ 4, 10,[[  0 ,1 ], [ 0,1 ]] ], ironBall_tranform );
         
      }
      for(i=0;i<8;i++){
          ironBall_tranform = Mat4.identity().times(Mat4.rotation(2*Math.PI/8*i,[1,0,0]))
                                             .times(Mat4.rotation(Math.PI/6,[0,-1,0]))
                                             .times(Mat4.translation([0,0,0.6])).times(Mat4.scale([0.2,0.2,0.2]))
          Closed_Cone.insert_transformed_copy_into( this, [ 4, 10,[[  0 ,1 ], [ 0,1 ]] ], ironBall_tranform );
      }
      for(i=0;i<4;i++){
          ironBall_tranform = Mat4.identity().times(Mat4.rotation(2*Math.PI/4*i,[1,0,0]))
                                             .times(Mat4.rotation(Math.PI/3,[0,-1,0]))
                                             .times(Mat4.translation([0,0,0.6])).times(Mat4.scale([0.2,0.2,0.2]));
          Closed_Cone.insert_transformed_copy_into( this, [ 4, 10,[[  0 ,1 ], [ 0,1 ]] ], ironBall_tranform );
          
      }
      for(i=0;i<1;i++){
          ironBall_tranform = Mat4.identity().times(Mat4.translation([0,0,0]))//.times(Mat4.rotation(2*Math.PI/4*i,[1,0,0]))
                                                                  .times(Mat4.rotation(Math.PI/2,[0,1,0]))
                                                                  .times(Mat4.translation([0,0,0.6])).times(Mat4.scale([0.2,0.2,0.2]))
          Closed_Cone.insert_transformed_copy_into( this, [ 4, 10,[[  0 ,1 ], [ 0,1 ]] ], ironBall_tranform );
      }
    }
  }
window.Little_Square = window.classes.Little_Square =
class Little_Square extends Shape              // A square, demonstrating two triangles that share vertices.  On any planar surface, the interior 
                                        // edges don't make any important seams.  In these cases there's no reason not to re-use data of
{                                       // the common vertices between triangles.  This makes all the vertex arrays (position, normals, 
  constructor()                         // etc) smaller and more cache friendly.
    { super( "positions", "normals", "texture_coords" );
      var size = 0.8;                                   // Name the values we'll define per each vertex.
      this.positions     .push( ...Vec.cast( [-size,-size,0], [size,-size,0], [-size,size,0], [size,size,0] ) );   // Specify the 4 square corner locations.
      this.normals       .push( ...Vec.cast( [0,0,1],   [0,0,1],  [0,0,1],  [0,0,1] ) );   // Match those up with normal vectors.
      this.texture_coords.push( ...Vec.cast( [0,0],     [1,0],    [0,1],    [1,1]   ) );   // Draw a square in texture coordinates too.
      this.indices       .push( 0, 1, 2,     1, 2, 3 );                   // Two triangles this time, indexing into four distinct vertices.
    }
}

window.Fire_Shader = window.classes.Fire_Shader =
class Fire_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
        gl.uniform1f ( gpu.animation_time_loc, g_state.animation_time / 1000 );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;
        varying float type;
        void main()
        {           
          gl_Position = projection_camera_transform *model_transform * vec4(object_space_pos, 1);
          position = vec4(object_space_pos, 1);
          center = vec4(0,0,0,1);
          type = 7.0;
          //gl_PointSize = 2.0;
        }`;           
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { 
      return `
        uniform float animation_time;
        float time = animation_time;
        varying float type;

        float snoise(vec3 uv, float res){
                const vec3 s = vec3(1e0, 1e2, 1e3);
                uv *= res;
                vec3 uv0 = floor(mod(uv, res))*s;
                vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;
                vec3 f = fract(uv); f = f*f*(3.0-2.0*f);
                vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
                                  uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);
                vec4 r = fract(sin(v*1e-1)*1e3);
                float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
                r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);
                float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
                return mix(r0, r1, f.z)*2.-1.;
        }                       
        float generate(vec3 coord, float type){
                float power = pow(2.0, type);
                return (1.5 / power) * snoise(coord + vec3(0.,-time*.05, time*.01), power*16.);     
        }            
        void main( void ) {
                //vec2 position2 = vec2(position.x,position.y+0.2);
                float ddd = 2.0*distance(position.xy,center.xy);
                float aaa = atan(position.y,position.x);                                                      
                vec2 p = vec2 ((ddd-2.0)*cos(5.0*aaa), (ddd-2.0)*sin(5.0*aaa));
                //vec2 p = vec2(position.x,position.y+0.5);
                //vec2 p = vec2 ((ddd-0.22*sin(aaa))*cos(1.5*aaa), (ddd-0.22*sin(aaa))*sin(1.5*aaa));
                float color = 3.0 - (3.*length(2.*p));
                vec3 coord = vec3(atan(p.x, p.y)/6.2832+.5, length(p)*.4, .5);
                if(type == 0.0){                    
                }
                else if(type == 7.0){
                    for(int i = 1; i <= 7; i++){                        
                        color += generate(coord, float(i));
                    }  
                }
                else{
                    color += generate(coord, type);
                }                
                gl_FragColor = vec4( color, pow(max(color,0.),2.)*0.4, pow(max(color,0.),3.)*0.15 , color);          
        }`; 
    }
}

window.Fire_2Shader = window.classes.Fire_2Shader =
class Fire_2Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       
    {                                                            
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
        gl.uniform1f ( gpu.animation_time_loc, g_state.animation_time / 1000 );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;
        varying float type;
        void main()
        {           
          gl_Position = projection_camera_transform *model_transform * vec4(object_space_pos, 1);
          position = vec4(object_space_pos, 1);
          center = vec4(0,0,0,1);
          type = 7.0;
        }`;           
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { 
      return `
        uniform float animation_time;
        float time = animation_time;
        varying float type;
        float snoise(vec3 uv, float res){
                const vec3 s = vec3(1e0, 1e2, 1e3);
                uv *= res;
                vec3 uv0 = floor(mod(uv, res))*s;
                vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;
                vec3 f = fract(uv); f = f*f*(3.0-2.0*f);
                vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
                                  uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);
                vec4 r = fract(sin(v*1e-1)*1e3);
                float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
                r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);
                float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
                return mix(r0, r1, f.z)*2.-1.;
        }   
        float generate(vec3 coord, float type){
                float power = pow(2.0, type);
                return (1.5 / power) * snoise(coord + vec3(0.,-time*.05, time*.01), power*16.);     
        }            
        void main( void ) {
                //vec2 position2 = vec2(position.x,position.y+0.2);
                float ddd = 1.0*distance(position.xy,center.xy);
                float aaa = atan(position.y,position.x);                                                      
                //vec2 p = vec2 ((ddd-2.0)*cos(5.0*aaa), (ddd-2.0)*sin(5.0*aaa));
                //vec2 p = vec2(position.x,position.y+0.5);
                vec2 p = vec2 ((ddd-0.22*sin(aaa))*cos(1.5*aaa), (ddd-0.22*sin(aaa))*sin(1.5*aaa));
                float color = 3.0 - (3.*length(2.*p));
                vec3 coord = vec3(atan(p.x, p.y)/6.2832+.5, length(p)*.4, .5);
                if(type == 0.0){                    
                }
                else if(type == 7.0){
                    for(int i = 1; i <= 7; i++){                        
                        color += generate(coord, float(i));
                    }  
                }
                else{
                    color += generate(coord, type);
                }                
                gl_FragColor = vec4( color, pow(max(color,0.),2.)*0.4, pow(max(color,0.),3.)*0.15 , color);
        }`;          
    }
}


class Texture_R extends New_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      
      return `
        
        uniform mat3 inverse_transpose_modelview;
        uniform sampler2D texture2;
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 
          vec2 tex_coord_new = vec2(f_tex_coord.x - 1.0*animation_time, f_tex_coord.y);
          vec4 tex_2color = texture2D(texture2, tex_coord_new);
          tex_2color = tex_2color *2.0 -1.0;
          vec3 my_Normal = normalize( inverse_transpose_modelview * tex_2color.xyz ); 
          vec4 tex_color = texture2D( texture, tex_coord_new );
          //vec4 tex_color = vec4(1,0,0,1);
          vec3 myT = normalize(cross(myN,vec3(1,1,-1)));
          
          vec3 myB = normalize(cross(myN,myT));
          mat3 TBN = mat3(myT.x,myB.x,myN.x,myT.y,myB.y,myN.y,myT.z,myB.z,myN.z);
          gl_FragColor = vec4( tex_color.xyz * ambient, tex_color.w );
          gl_FragColor.xyz += phong_model_lights(my_Normal, tex_color );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_L extends New_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      
      return `
        
        uniform mat3 inverse_transpose_modelview;
        uniform sampler2D texture2;
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 
          vec2 tex_coord_new = vec2(f_tex_coord.x + animation_time, f_tex_coord.y);
          vec4 tex_2color = texture2D(texture2, tex_coord_new);
          tex_2color = tex_2color *2.0 -1.0;
          vec3 my_Normal = normalize( inverse_transpose_modelview * tex_2color.xyz ); 
          vec4 tex_color = texture2D( texture, tex_coord_new );
          //vec4 tex_color = vec4(1,0,0,1);
          vec3 myT = normalize(cross(myN,vec3(1,1,-1)));
          
          vec3 myB = normalize(cross(myN,myT));
          mat3 TBN = mat3(myT.x,myB.x,myN.x,myT.y,myB.y,myN.y,myT.z,myB.z,myN.z);
          gl_FragColor = vec4( tex_color.xyz * ambient, tex_color.w );
          gl_FragColor.xyz += phong_model_lights(my_Normal, tex_color );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_T extends New_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      return `
        
        uniform mat3 inverse_transpose_modelview;
        uniform sampler2D texture2;
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 
          vec2 tex_coord_new = vec2(f_tex_coord.x , f_tex_coord.y - animation_time);
          vec4 tex_2color = texture2D(texture2, tex_coord_new);
          tex_2color = tex_2color *2.0 -1.0;
          vec3 my_Normal = normalize( inverse_transpose_modelview * tex_2color.xyz ); 
          vec4 tex_color = texture2D( texture, tex_coord_new );
          //vec4 tex_color = vec4(1,0,0,1);
          vec3 myT = normalize(cross(myN,vec3(1,1,-1)));
          
          vec3 myB = normalize(cross(myN,myT));
          mat3 TBN = mat3(myT.x,myB.x,myN.x,myT.y,myB.y,myN.y,myT.z,myB.z,myN.z);
          gl_FragColor = vec4( tex_color.xyz * ambient, tex_color.w );
          gl_FragColor.xyz += phong_model_lights(my_Normal, tex_color );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_B extends New_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      
      return `
        
        uniform mat3 inverse_transpose_modelview;
        uniform sampler2D texture2;
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 
          vec2 tex_coord_new = vec2(f_tex_coord.x , f_tex_coord.y + animation_time);
          vec4 tex_2color = texture2D(texture2, tex_coord_new);
          tex_2color = tex_2color *2.0 -1.0;
          vec3 my_Normal = normalize( inverse_transpose_modelview * tex_2color.xyz ); 
          vec4 tex_color = texture2D( texture, tex_coord_new );
          //vec4 tex_color = vec4(1,0,0,1);
          vec3 myT = normalize(cross(myN,vec3(1,1,-1)));
          
          vec3 myB = normalize(cross(myN,myT));
          mat3 TBN = mat3(myT.x,myB.x,myN.x,myT.y,myB.y,myN.y,myT.z,myB.z,myN.z);
          gl_FragColor = vec4( tex_color.xyz * ambient, tex_color.w );
          gl_FragColor.xyz += phong_model_lights(my_Normal, tex_color );                     
        }`;
    }
}

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       
    { 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );                                                                                        
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;
        void main()
        { 
          gl_Position = projection_camera_transform *model_transform* vec4(object_space_pos, 1);
          position = vec4(object_space_pos.x,0,0, 1);
          center = vec4(0,0,0,1);
        }`;           
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        {          
          gl_FragColor = vec4(1,sin(19.0*distance(center,position)),sin(19.0*distance(center,position)),1);
        }`;           
    }
}


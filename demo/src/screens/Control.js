import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Alert, Modal, StatusBar } from 'react-native';
import Slider from "react-native-slider";
import StepModal from '../components/StepModal';

import fetchTimeout from 'fetch-timeout';
import CircularSlider from 'rn-circular-slider'

import MenuButton from '../components/MenuButton'
import ArrowLeft from '../components/ArrowLeft'

import { NavigationEvents } from 'react-navigation'


export default class Control extends Component{

   
    constructor(){
        super()
        this.state = {

            valueZ: 0,
            lastValueZ: 0,
            valueX: 0,
            lastValueX: 0,
            valueR: 0,
            lastValueR: 0,

            isModalXvisible: false,
            isModalZvisible: false,
            stepX: 1,
            stepZ: 1,

            timer: null,
            actualPreset: 0,
            temaNegro: false,
        } 
    
    }    

    handleChange = value => {
        console.log(`Changed value ${value}`);
        this.setState({ valueR });
    };
 
    handleChangeRange = event => {
        this.setState({
            valueR: event.target.valueAsNumber,
        });
    };

    sendVerticalSlider = (lastValueZ) => {
        if (this.state.valueZ !== this.state.lastValueZ){
            this.setState({ lastValueZ });
            this.sendData("Z", this.state.valueZ, false, null);
        }
    }

    buttonVerticalSliderN = () => {
        this.setState({valueZ: this.state.valueZ - parseInt(this.state.stepZ)});
        this.setState({lastValueZ: this.state.valueZ});
        setTimeout(function(){
            this.sendData("Z", this.state.valueZ, false, null);
        }.bind(this), 1);        
    }

    buttonVerticalSliderP = () => {
        this.setState({valueZ: this.state.valueZ + parseInt(this.state.stepZ)});
        this.setState({lastValueZ: this.state.valueZ});
        setTimeout(function(){
            this.sendData("Z", this.state.valueZ, false, null);
        }.bind(this), 1);  
    }

    sendSlider = (lastValueX) => {
        if (this.state.valueX !== this.state.lastValueX){
            this.setState({ lastValueX });
            this.sendData("X", this.state.valueX, false, null);
        }
    }

    buttonSliderN = () => {
        this.setState({valueX: this.state.valueX - parseInt(this.state.stepX)});
        this.setState({lastValueX: this.state.valueX});
        setTimeout(function(){
            this.sendData("X", this.state.valueX, false, null);
        }.bind(this), 1); 
    }

    buttonSliderP = () => {
        this.setState({valueX: this.state.valueX + parseInt(this.state.stepX)});
        this.setState({lastValueX: this.state.valueX});
        setTimeout(function(){
            this.sendData("X", this.state.valueX, false, null);
        }.bind(this), 1);        
    }

    sendCircleSlider = (valueR, lastValueR) => {
        clearTimeout(this.state.timer);
        this.state.timer = setTimeout(function(){
            this.setState({ valueR });
            if (this.state.valueR !== this.state.lastValueR){
                this.setState({ lastValueR });
                this.sendData("R", this.state.valueR, false, null);
            }
        }.bind(this), 1);        
    }

    sendData = (direccion, valor, preset, nroPreset) => {
        Alert.alert(global.pickerValue);
        let IP = global.pickerValue;
        // fetchTimeout('http://' + IP + ':3000/move', {
        //     method: 'POST',
        //     headers: {
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         direction: direccion,
        //         value: parseInt(valor),
        //     })
        // }, 5000)
        //     .then((response) => response.json())
        //         .then((responseJson) => {
        //             if(responseJson.msg === "Listo"){
        //                 if (preset){
        //                     Alert.alert("Posicion cambiada al brazo " + IP, "Se movió a las coordenadas del preset" + nroPreset);
        //                 }
        //                 else if (!preset){
        //                     Alert.alert("Posicion cambiada al brazo " + IP, direccion + " -> " + valor);
        //                 }
        //             }
        //         })
        //         .catch((error) => {
        //             //console.error(error);
        //             Alert.alert("Brazo no encontrado", "Verifique que su brazo este encendido y conectado a la red");
        //         });
    }

    checkActualPreset(n){
        if(n == this.state.actualPreset){
            return true
        }
    }

    changePreset(n){

        const newPresetZ = global.presetZ
        const newPresetX = global.presetX
        const newPresetR = global.presetR

        this.setState({
            actualPreset: n,
            valueZ: newPresetZ[n],
            valueX: newPresetX[n],
            valueR: newPresetR[n]
        });

        console.log("X: " + this.state.valueX);
        console.log("Z: " + this.state.valueZ);
        console.log("R: " + this.state.valueR);

        setTimeout(function(){
            this.sendData("X", this.state.valueX, "Preset", null);
        }.bind(this), 1); 
        setTimeout(function(){
            this.sendData("Z", this.state.valueZ, "Preset", null);
        }.bind(this), 1); 
        setTimeout(function(){
            this.sendData("R", this.state.valueR, true, this.state.actualPreset);
        }.bind(this), 1); 
    }

    saveActualPreset(p){

        const newPresetZ = global.presetZ;
        const newPresetX = global.presetX;
        const newPresetR = global.presetR;
      
        newPresetZ[p] = this.state.valueZ; //Como no se puede poner this.state.presetZ[1] por ejemplo, creo una const, le cargo los valores del array y accedo a un index
        newPresetX[p] = this.state.valueX;
        newPresetR[p] = this.state.valueR;

        global.presetZ = newPresetZ;
        global.presetX = newPresetX;
        global.presetR = newPresetR;

        fetch('http://'+ global.IP + '/saveNewPreset', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: global.nombre,
                nroPreset: p,
                valueX: this.state.valueX,
                valueZ: this.state.valueZ,
                valueR: this.state.valueR,
            })
        })
            .then((response) => response.json())
                .then((responseJson) => {
                    if(responseJson.msg === "Listo"){
                        Alert.alert("Preset guardado!");
                    }
                    else if(responseJson.msg === "Error, funcionamiento"){
                        Alert.alert("ERROR", "Hubo un fallo en la aplicación");
                    }        
                    else if(responseJson.msg === "Error, usuario"){
                        Alert.alert("ERROR", "El usuario no existe");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
    }

    longPress(){
        console.log("Mantuviste apretado")
    }

    changeModalXVisibility = (bool) => {
        this.setState({ isModalXvisible: bool });
    }
    changeModalZVisibility = (bool) => {
        this.setState({ isModalZvisible: bool });
    }

    setStepX = (data) => {
        this.setState({ stepX: data})
    }

    setStepZ = (data) => {
        this.setState({ stepZ: data})
    }
    
    render(){
        
        const {goBack} = this.props.navigation;

        // let IPs = global.brazos.map((s, i) => {
        //     return <Picker.Item key={i} value={s} label={s} />
        // });            


        return(

            <View style={this.state.temaNegro ? styles.darkContainer : styles.container}>
                
                <NavigationEvents
                    onDidFocus={() => this.setState({
                        temaNegro: global.temaNegro
                    })}
                />

                <StatusBar hidden/>

                <View style={styles.header}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{width: 40, height: 40}}>
                            <ArrowLeft/>
                        </TouchableOpacity>
                        <View style={styles.circleButtonsContainer}>
                            <TouchableOpacity onPress={() => this.changePreset(0)} style={this.checkActualPreset(0) ? styles.circleButtonSelected : styles.circleButton}>
                                <Text style={styles.txtStyle}>1</Text>     
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.changePreset(1)} style={this.checkActualPreset(1) ? styles.circleButtonSelected : styles.circleButton}>
                                <Text style={styles.txtStyle}>2</Text>     
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.changePreset(2)} style={this.checkActualPreset(2) ? styles.circleButtonSelected : styles.circleButton}>
                                <Text style={styles.txtStyle}>3</Text>     
                            </TouchableOpacity>
                        </View>
                        <MenuButton navigation={this.props.navigation} />
                </View>
                
                
                <View style={styles.sliderZContainer}>
                    
                        <TouchableOpacity style={styles.btnStyle} onPress={this.buttonVerticalSliderN} onLongPress={() => this.changeModalZVisibility(true)}>
                            <Image source={this.state.temaNegro ? require('../images/icons/darkControlLeft.png') : require('../images/icons/controlLeft.png')} style={styles.menuIcon}/>
                        </TouchableOpacity>


                        <Slider
                            trackStyle={this.state.temaNegro ? customStyles4.darkTrack : customStyles4.track}
                            thumbStyle={customStyles4.thumb}
                            minimumTrackTintColor={this.state.temaNegro ? '#fff' : '#000'}
                            minimumValue={-100}
                            maximumValue={100}
                            step={1}
                            value={this.state.valueZ}
                            onValueChange={valueZ => this.setState({ valueZ })}
                            onSlidingComplete={this.sendVerticalSlider}   
                            vertical
                            style={styles.sliderZ}                         
                        />
                        <TouchableOpacity style={styles.btnStyle} onPress={this.buttonVerticalSliderP} onLongPress={() => this.changeModalZVisibility(true)}>
                            <Image source={this.state.temaNegro ? require('../images/icons/darkControlRight.png') : require('../images/icons/controlRight.png')} style={styles.menuIcon}/>
                        </TouchableOpacity>

                </View>

                <View style={styles.sliderXContainer}>
                        <TouchableOpacity style={styles.btnStyle} onPress={this.buttonSliderN} onLongPress={() => this.changeModalXVisibility(true)}>
                            <Image source={this.state.temaNegro ? require('../images/icons/darkControlLeft.png') : require('../images/icons/controlLeft.png')} style={styles.menuIcon}/>
                        </TouchableOpacity>
                        <Slider
                            trackStyle={this.state.temaNegro ? customStyles4.darkTrack : customStyles4.track}
                            thumbStyle={customStyles4.thumb}
                            minimumTrackTintColor={this.state.temaNegro ? '#fff' : '#000'}
                            minimumValue={-100}
                            maximumValue={100}
                            step={1}
                            value={this.state.valueX}
                            onValueChange={valueX => this.setState({ valueX })}   
                            onSlidingComplete={this.sendSlider}   
                            style={styles.sliderX}  
                                                
                        />
                        <TouchableOpacity style={styles.btnStyle} onPress={this.buttonSliderP} onLongPress={() => this.changeModalXVisibility(true)}>
                            <Image source={this.state.temaNegro ? require('../images/icons/darkControlRight.png') : require('../images/icons/controlRight.png')} style={styles.menuIcon}/>
                        </TouchableOpacity>
                </View>

                <Modal transparent ={true} visible={this.state.isModalXvisible} onRequestClose={() => this.changeModalXVisibility(false)} animationType='fade'>
                    <StepModal changeModalVisibility={this.changeModalXVisibility} setData={this.setStepX}/>
                </Modal>

                <Modal transparent ={true} visible={this.state.isModalZvisible} onRequestClose={() => this.changeModalZVisibility(false)} animationType='fade'>
                    <StepModal changeModalVisibility={this.changeModalZVisibility} setData={this.setStepZ}/>
                </Modal>
                        

                <View style={styles.sliderRContainer}>

                    <CircularSlider
                        style={styles.halfCircleSlider}
                        step={1}
                        min={-45}
                        max={45}
                        value={this.state.valueR}
                        onChange={this.sendCircleSlider}
                        strokeWidth={4}
                        buttonBorderColor="#A82574"
                        buttonFillColor="#A82574"
                        buttonStrokeWidth={5}
                        openingRadian={Math.PI / 2}
                        buttonRadius={11}
                        radius={90}
                        backgroundTrackColor={this.state.temaNegro ? '#fff' : '#000'}
                        linearGradient={[{ stop: '100%', color: this.state.temaNegro ? '#fff' : '#000' }, { stop: '100%', color: '#000' }]}
                        >
                    </CircularSlider>

                </View>

                <View style={styles.saveContainer}> 
                    <TouchableOpacity style={styles.btnStyle} onPress={() => this.saveActualPreset(this.state.actualPreset)}>
                            <Image source={require('../images/icons/saveIcon.png')} style={styles.saveIcon}/>
                    </TouchableOpacity>
                </View>

            </View>

        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff'
    },
    darkContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#000'

    },
    sliderZContainer: {
        flex: 1.5,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 60,        
        alignItems: 'center',
        transform: [{ rotate: '-90deg' }]
    },
    sliderXContainer: {
        flex: 0.5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginTop: 60,
        marginBottom: 70
        
    },
    sliderRContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 22,
        marginRight: 20
    },
    circleButtonsContainer: {
        top: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleButton: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(168,37,116,0.55)',
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: 'rgba(0,0,0,0.14)',
        borderRadius: 90,
        marginBottom: 20,
        marginHorizontal: 5,
    },
    circleButtonSelected: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(168,37,116,1)',
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: 'rgba(0,0,0,0.14)',
        borderRadius: 90,
        marginBottom: 20,
        marginHorizontal: 5,
    },
    txtStyle: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center'
    },
    sliderZ: {
        width: 150,
    },
    sliderX: {
        width: 200,
    },
    halfCircleSlider: {
        marginTop: 40
    },     
    arrowImage: {
        width: 30,
        height: 30
    },
    semicirculo: {
        
        width: 150,
        height: 150,
        borderRadius: 150 / 2,
        backgroundColor: '#FF00FF',
        
    },
    dropdown: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      },
    picker: {
        height: 30,
        width: 150,
        overflow: 'hidden',
        backgroundColor: '#eb52ba',
        borderColor: '#fff',
        borderWidth: 1.8, 
        borderRadius: 50, 
        marginLeft: 25
    },
    header: {
        flex: 0.5,
        backgroundColor: 'rgba(235,235,235,1)',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.3)'
    },
    titulo: {
        fontSize: 30,
        marginLeft: 80,
        marginTop: 10,
        fontWeight: '300'
        
    },
    axelito: {
        backgroundColor: '#d14ba6',
        borderRadius: 10,
        opacity: 0.3,
        textAlign: 'center'
    },
    numeros: {
        position: 'absolute'
    }, 
    wifiIcon: {
        zIndex: 9,
        position: 'absolute',
        top: 33,
        left: 25,
    },
    saveIcon: {
        width: 60,
        height: 60
    },
    menuIcon: {
        zIndex: 9,
        width: 40,
        height: 40
    },
    btnStyle: {
        width: 40,
        height: 40
    }
    

});

var customStyles4 = StyleSheet.create({
    track: {
      height: 4,
      borderRadius: 4,
      backgroundColor: '#000',
      padding: 2,
      borderWidth: 3,
      borderColor: 'rgba(168,37,116,0.1)'
    },
    darkTrack: {
        height: 4,
        borderRadius: 4,
        backgroundColor: '#fff',
        padding: 2,
        borderWidth: 3,
        borderColor: 'rgba(168,37,116,0.1)'
  
      },
    thumb: {
      width: 25,
      height: 25,
      backgroundColor: '#A82574',
      borderColor: '#A82574',
      borderWidth: 5,
      borderRadius: 15,
    }
  });

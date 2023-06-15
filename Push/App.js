//Token Id expo- 
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { StyleSheet, Text, View, Button } from 'react-native';
import {useEffect, useState, useRef} from 'react';


//Funcion para ingreso de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


export default function App() {
  const[expoPushToken,setExpoPushToken]=useState("");
  const[notification,setNotification]=useState(false);
  const notificationListener=useRef();
  const responseListener=useRef();


  useEffect(()=>{
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });
    responseListener.current = Notifications.addNotificationReceivedListener(response=>{
      console.log(response)
    });
    return()=>{
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current)
    };

  },[]);

  //Funcion para envio masivo a todos los dispositivos
  const sendPushNoticacitionMasivo= async()=>{
    try{
      const mensaje={
        to:expoPushToken,
        sound:'default',
        title:'Mensaje masivo de Prueba',
        body:'Esta sera una notificacion para todos los dispositivos',
        data:{data: 'additional data'},
      };
      await fetch('https://exp.host/--//v2/push/send',{
        method:'POST',
        headers:{
      Accept:'application/json',
      'Accept-encoding':'gzip,deflate',
      'Contente-Type':'application/json',
    },
    body: JSON.stringify(mensaje)
      });
    console.log("Notificacion enviada con exito....");
    }catch(error){
      console.log("Error al enviar el mensaje",error)
    }
  };

  return (
    <View style={styles.container}>
      <Text>Token dispositivo: {expoPushToken}</Text>
      <Button
        title="Enviar Mensaje Masivo"
        onPress={sendPushNoticacitionMasivo}
      />
    </View>
  );
}
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

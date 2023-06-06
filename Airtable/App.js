//IMPORTAR LOS ARCHIVOS
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Estilos par los componentes
const styles=StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  cardContainer:{
    flexGrow:1,
    justifyContent:'center',
    alignItems:'center',
  },
  card:{
    width:300,
    backgroundColor:'#fff',
    borderRadius:10,
    marginBottom:10,
    padding:10,
    shadowColor: '#000',
    shadowOffset:{
      width:0,
      height:2,
    },
    shadowOpacity:0.25,
    shadowRadius:3,
    elevation:5,
  },
  image:{
    width:'100%',
    height:250,
    borderRadius:10,
    marginBottom:10,
  },
  name:{
    fontSize:18,
    fontWeight:'bold',
    marginBottom:8,
  },
  price:{
    fontSize:16,
  },
});

//Paso 2 - Modificaremos la funcion principal para obtener los datos y ingresarlo de manera dinamica a un cardview
const App = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  //Paso 1 - Modificacion de la funcion para obtener los datos de la tabla Producto
  const fetchData = async () => {
    try {
      const response = await axios.get(
        'https://api.airtable.com/v0/suidbasededatos/nombredelatabla',
        {
          headers: {
            Authorization: 'Bearer suapikey',
          },
        }
      );
      setData(response.data.records);
    } catch (error) {
      console.error(error);
    }
  };
//Funcion para manejar los datos y renderizar
const renderCard=(product)=>{
  return (
    <View key={product.id} style={styles.card}>
      <Image source={{uri:product.fields.Imagen}}
      style={styles.image}
      />
      <Text
       style={styles.name}
       >
        {product.fields.Nombre}
      </Text>
      <Text style={styles.price}>
      {product.fields.Precio} Bs

      </Text>
    </View>
  );
};
//Mostrar los datos obtenidos
  
  return (
    <View style={styles.container}>
      {data.length> 0? (
        <ScrollView contentContainerStyle={styles.cardContainer}>
          {data.map((product)=>renderCard(product))}
        </ScrollView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};
export default App;


import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { DocumentPicker } from 'expo';
import { app } from '../config';
import BotaoAnterior from '../components/BotaoAnterior';
import BotaoProximo from '../components/BotaoProximo';
import InputTexto from '../components/InputTexto';
import BotaoEnvioArquivo from '../components/BotaoEnvioArquivo';
import styles from '../styles/estilos';

export default class QuestaoContexto extends Component {  
constructor(props) {
  super(props);
  this.state = {
    loading: false,
    loaded: false,
    document: null,
    url: ''
  }
}
  static navigationOptions = {
    title: '',
  };

  handleFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
      if (!result.cancelled) {
        this.upload(result.uri, result.name)
          .then(() => 
          {
            if (result.uri)
              this.setState({ document: result.uri, loading: false, loaded: true });
          })
          .catch((error) => {
            alert('Falha no upload, verifique a conexão.\n erro:', error);
          });
      }
  }

  urlToBlob = (uri) => {
    //reference: https://github.com/expo/expo/issues/2402
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response); // when BlobModule finishes reading, resolve with the blob
      };
      xhr.onerror = function() {
        reject(new TypeError('Network request failed')); // error occurred, rejecting
      };
      xhr.responseType = 'blob'; // use BlobModule's UriHandler
      xhr.open('GET', uri, true); // fetch the blob from uri in async mode
      xhr.send(); // no initial data
    });
  }

  upload = async (uri, name) => {
    if(uri) {
      this.setState({loading: true, loaded: false});
      const blob = await this.urlToBlob(uri);
      const ref = app.storage().ref().child('questao/pdfs/'+name);
      const snap = await ref.put(blob);
      const remoteUri = await snap.ref.getDownloadURL();

      blob.close();
      return remoteUri;
    }
    return null;
  }

  handleURL = (value) => {
    this.setState({url: value});
  }

  render() {
    const { loading, loaded, url } = this.state;
    return (
      <View style={styles.container}>
        <View styles={styles.innerContainer}>
          <Text style={[contextStyles.titulo, contextStyles.titulo1]}>Dica:</Text>
          <Text style={[contextStyles.titulo, contextStyles.titulo2]}>É importante contextualizar a sua pergunta para que os votantes entendam:</Text>

          <View style={contextStyles.container}>

            <View>
              <Text style={[contextStyles.titulo3, {marginBottom: 15}]}>
              Vamos adicionar um arquivo (Exemplo: PDF ou imagem) contextualizando a 
              <Text style={{color: '#8400C5'}}> questão 1</Text>?
              </Text>
            </View>

            <View>
              <BotaoEnvioArquivo
                loaded={!!loaded}
                loading={!!loading}
                onPress={() => this.handleFile()}
                texto="Anexar Arquivo"
              />
            </View>

            <View>
              <Text style={[contextStyles.titulo3, contextStyles.titulo4]}>
                Vamos adicionar um URL externo contextualizando a 
                <Text style={{color: '#8400C5'}}> questão 1</Text>?
              </Text>
            </View>

            <InputTexto
              label="URL:"
              onChangeText={value => this.handleURL(value)}
              placeholder='https://woopsicredi.com/'
              value={url}
            />
          </View>
        </View>
        
        <View style={styles.flowButtonsContainer}>

          <BotaoAnterior
            endereco='Questao' 
            navigation={this.props.navigation} 
            style={styles.icon} 
          />
          <BotaoProximo 
            endereco='QuestaoSalva' 
            navigation={this.props.navigation} 
            style={styles.icon} 
          />

        </View>
      </View>
    );
  }
}

const contextStyles = StyleSheet.create({
  container: {
    marginTop: 100
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  titulo1: {
    color: '#00E576'
  },
  titulo2: {
    color: '#A800D0'
  },
  titulo3: {
    textAlign: 'center',
    color: '#00FD8C',
    fontSize: 18,
    fontWeight: 'bold'
  },
  titulo4: {
    marginTop: 100
  }
});
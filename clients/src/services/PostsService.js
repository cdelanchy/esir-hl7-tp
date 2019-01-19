import Api from '@/services/Api'

export default {
  fetchPosts () {
    return Api().get('patients')
  },

  addPatient (params) {
    return Api().post('patients', params)
  },

  sendFile (formData) {
    console.log(formData)
    return Api().post('/upload',
      formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    ).then(function (res) {
      return (res.data)
    })
      .catch(function () {
        return ({type: 'error', message: 'An error occured'})
      })
  }
}

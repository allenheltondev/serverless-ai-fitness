export const config = {
	aws_project_region: process.env.NEXT_PUBLIC_region,
	Auth: {
		region: process.env.NEXT_PUBLIC_region,
		userPoolId: process.env.NEXT_PUBLIC_userpoolId,
		userPoolWebClientId: process.env.NEXT_PUBLIC_userPoolWebClientId,
		identityPoolId: process.env.NEXT_PUBLIC_identityPoolId,
    oauth: {
      domain: 'auth.readysetcloud.io',
      scope: [
        'email',
        'profile',
        'openid',
        //'aws.cognito.signin.user.admin'
      ],
      redirectSignIn: process.env.NEXT_PUBLIC_redirect,
      redirectSignOut: 'https://fitness.readysetcloud.io',
      responseType: 'code',
      redirect_uri: process.env.NEXT_PUBLIC_redirect
    }
	},  
	aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_appSyncURL,
	aws_appsync_region: process.env.NEXT_PUBLIC_region,
	aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
}
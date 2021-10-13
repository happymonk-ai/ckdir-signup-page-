export interface IResolverBody {
	did: string;
}
export interface IResolverHeader {
	did: string;
}
export interface IResolverParams {
}
export interface IResolverQuery {
}
export interface IRegisterBody {
	did: string;
	registrationType: string;
	action: string;
	organisationName: string;
	organisationGovernmentId: string;
	isVerified: boolean;
	phoneNumber: string;
	countryCode: string;
	email: string;
	role: string;
	orgDid: string;
	isPhoneVerified: boolean;
	isEmailVerified: boolean;
	deviceDid: string;
	isDeviceVerified: string;
	deviceId: string;
	adminDid: string;
	locationDid: string;
	zoneDid: string;
	location: string;
	deviceSteamUrl: string[];
	totalNumberOfStreams: string;
	registrationPeerId: string;
	deviceInitialFrame: string;
	dataDNSLink: string;
}
export interface IRegisterParams {
}
export interface IRegisterHeader {
}
export interface IRegisterQuery {
}
export interface IServiceBody {
	requestType: string; // can be register, signup, signin
	did: string;
}
export interface IServiceParams {
}
export interface IServiceQuery {
}
export interface IServiceHeader {
}
export interface IRequestBody {
	did: string;
	organisationDid: string;
}
export interface IRequestHeader {
}
export interface IRequestQuery {
}
export interface IRequestParams {
}

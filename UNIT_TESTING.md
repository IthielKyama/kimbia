# Kimbia Backend Unit Testing Specification

## Detailed Test Catalog by Layer

---

### Layer 1: Core Domain Services (`com.kimbia.backend.service`)

The service layer contains **1,155 lines (34.7% of the codebase)** and encapsulates all financial transactions, race lifecycle logic, authentication, and moderation workflows.

---

#### 1.1 `PaymentServiceTest`
- **Class Under Test**: `com.kimbia.backend.service.PaymentService` (388 lines)
- **Mocks**:
  - `UserRepository`
  - `RaceRepository`
  - `RegistrationRepository`
  - `PaymentRepository`
  - `RaceResultRepository`
  - `TinggService`
  - `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `initiateCheckout_userNotFound_throwsRuntimeException` | User email not found in `userRepository`. | Throws `RuntimeException` with message `"User not found"`. |
| `initiateCheckout_raceNotFound_throwsRuntimeException` | Valid user, race ID not in `raceRepository`. | Throws `RuntimeException` with message `"Race not found"`. |
| `initiateCheckout_alreadyRegisteredCompleted_throwsRuntimeException` | User already registered with `PaymentStatus.COMPLETED`. | Throws `RuntimeException` with message `"You are already registered for this race."`. |
| `initiateCheckout_existingPendingRegistration_reusesRegistrationAndCreatesPayment` | User has existing registration with `PaymentStatus.PENDING`. | Reuses registration, saves pending payment with generated `TX_` prefix, returns valid `CheckoutResponse`. |
| `initiateCheckout_newRegistration_createsActiveRegistrationAndPendingPayment` | User has no prior registration for race. | Creates new `Registration` (status `ACTIVE`, payment `PENDING`), creates `Payment` with fee, generates Tingg payload, returns `CheckoutResponse`. |
| `initiateCheckout_returnUrlPlaceholders_replacesIdCorrectly` | Return URLs contain `__id__`, `{id}`, or `%7Bid%7D`. | Formats URLs replacing placeholders with the registration ID. |
| `initiateCheckout_defaultReturnUrl_whenNullOrEmpty` | `returnUrl` argument is null or empty string. | Defaults to `http://localhost:3000/races/{raceId}/checkout-success`. |
| `initiateCheckout_tinggFailureWithSimulation_callsSimulateSuccessAndReturnsRedirect` | `TinggService.getCheckoutUrl` throws exception and `simulateOnFailure=true`. | Catches exception, executes fallback simulation (marking registration completed), and returns redirect target without throwing. |
| `initiateCheckout_tinggFailureWithoutSimulation_rethrowsException` | `TinggService.getCheckoutUrl` throws exception and `simulateOnFailure=false`. | Propagates exception up to caller. |
| `processWebhook_transactionNotFound_returnsStatusCode180` | Webhook payload with unknown `merchant_transaction_id`. | Returns `TinggWebhookAckResponse` with `status_code="180"` ("Payment rejected - transaction not found"). |
| `processWebhook_alreadyCompleted_idempotentSuccess183` | Payment record already has status `COMPLETED`. | Returns `status_code="183"`, `status_description="Successfully"`, and receipt number `"ACK" + id`. |
| `processWebhook_statusCode178_completesPaymentAndAssignsBib` | Webhook status code is `178` (Tingg success). | Marks payment `COMPLETED`, marks registration `COMPLETED`, generates bib `"BIB-" + id` and placeholder bib image URL, saves payment & registration, returns `183`. |
| `processWebhook_non178StatusCode_marksPaymentFailed` | Webhook status code is not `178` (e.g. `179`, `181`). | Marks payment `FAILED`, acknowledges with `status_code="183"` to prevent Tingg retry storms. |
| `simulateSuccess_registrationAndPaymentFound_invokesProcessWebhook` | Valid registration ID with matching payment. | Constructs simulated webhook payload with status `178` and transitions payment to `COMPLETED`. |
| `simulateSuccess_registrationNotFound_noOp` | Nonexistent registration ID. | Gracefully handles missing record without throwing unexpected NPE. |
| `processAwardPayout_nullRegistrationId_throwsIllegalArgumentException` | Request has null `registrationId`. | Throws `IllegalArgumentException` ("registration_id is required"). |
| `processAwardPayout_nullOrZeroOrNegativeAmount_throwsIllegalArgumentException` | Request amount is `null`, `0`, or negative. | Throws `IllegalArgumentException` ("Valid payout amount is required"). |
| `processAwardPayout_registrationNotFound_throwsIllegalArgumentException` | Registration ID not in database. | Throws `IllegalArgumentException` ("Registration not found for ID..."). |
| `processAwardPayout_raceAdminNotOrganizer_throwsSecurityException` | Caller is `RACE_ADMIN` but race organizer ID does not match caller ID. | Throws `SecurityException` ("Cannot disburse awards for a race you do not organize"). |
| `processAwardPayout_superAdmin_allowsPayoutForAnyRace` | Caller has `Role.SUPER_ADMIN`. | Authorization passes regardless of race organizer ID. |
| `processAwardPayout_raceAdminOrganizer_allowsPayout` | Caller is `RACE_ADMIN` and matches race organizer. | Authorization passes. |
| `processAwardPayout_missingRaceResult_throwsIllegalStateException` | No `RaceResult` found for registration. | Throws `IllegalStateException` ("No race result found..."). |
| `processAwardPayout_resultNotApproved_throwsIllegalStateException` | Result moderation status is `PENDING` or `REJECTED`. | Throws `IllegalStateException` ("Cannot disburse award: Race result status is... but must be APPROVED"). |
| `processAwardPayout_awardTypeAirtime_setsAirtime` | Request award type string is `"AIRTIME"`. | Sets payment award type to `AwardType.AIRTIME`. |
| `processAwardPayout_awardTypeMoneyDefault_setsMoney` | Request award type is null or `"MONEY"`. | Defaults to `AwardType.MONEY`. |
| `processAwardPayout_destinationAccountFallbackToUserMobile_usesMobile` | `destinationAccount` is null/blank; user has `mobileNumber`. | Successfully uses `user.getMobileNumber()`. |
| `processAwardPayout_noDestinationOrMobile_throwsIllegalArgumentException` | Both `destinationAccount` and user mobile number are null/blank. | Throws `IllegalArgumentException` ("destination_account or user mobile number is required..."). |
| `processAwardPayout_invokesTinggWithOrganizerServiceCode` | Organizer has custom `tinggServiceCode`. | Calls `tinggService.initiatePayout(payment, serviceCode)` passing the organizer's service code. |
| `handlePayoutCallback_blankMerchantTxId_throwsIllegalArgumentException` | Callback payload missing `merchant_transaction_id`. | Throws `IllegalArgumentException` ("merchant_transaction_id is required in payout callback"). |
| `handlePayoutCallback_paymentNotFound_throwsIllegalArgumentException` | `merchant_transaction_id` not found in database. | Throws `IllegalArgumentException` ("Payment not found..."). |
| `handlePayoutCallback_alreadyCompleted_returnsAlreadyProcessed` | Payment is already `COMPLETED`. | Idempotently returns map with `status="already_processed"`. |
| `handlePayoutCallback_successStatusCodes_completesPayment` | Status codes `217`, `178`, or `200`. | Sets payment status `COMPLETED`, saves payment, returns `"acknowledged"`. |
| `handlePayoutCallback_otherStatusCode_marksPaymentFailed` | Status code is `154`, `167`, etc. | Sets payment status `FAILED`, saves payment, returns `"acknowledged"`. |
| `simulatePayoutSuccess_paymentFound_marksCompleted` | Valid payment ID. | Updates payment status to `COMPLETED` and saves. |
| `simulatePayoutSuccess_paymentNotFound_throwsIllegalArgumentException` | Nonexistent payment ID. | Throws `IllegalArgumentException`. |
| `getAwardPayments_unauthenticated_throwsSecurityException` | Auth is null or `"anonymousUser"`. | Throws `SecurityException` ("Authentication is required..."). |
| `getAwardPayments_superAdmin_queriesWithAllFilterCombinations` | Auth is `SUPER_ADMIN`. | Tests all 4 query branches: (raceId + awardType), (raceId only), (awardType only), (no filters). |
| `getAwardPayments_raceAdmin_queriesScopedToOrganizer` | Auth is `RACE_ADMIN`. | Tests all 4 organizer-scoped query branches. |
| `getAwardPayments_runnerRole_throwsSecurityException` | Auth is `RUNNER`. | Throws `SecurityException` ("Access denied: only race admins or super admins..."). |

---

#### 1.2 `RaceServiceTest`
- **Class Under Test**: `com.kimbia.backend.service.RaceService` (176 lines)
- **Mocks**: `RaceRepository`, `UserRepository`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getPublishedRaces_returnsPublishedRaces` | Repository has published races. | Returns list from `raceRepository.findByStatus(RaceStatus.PUBLISHED)`. |
| `getRaceById_exists_returnsRace` | Race ID exists. | Returns `Race` entity. |
| `getRaceById_notFound_throwsIllegalArgumentException` | Race ID does not exist. | Throws `IllegalArgumentException` with message containing race ID. |
| `createRace_unauthenticated_throwsSecurityException` | Unauthenticated caller. | Throws `SecurityException` ("Authentication is required"). |
| `createRace_runnerRole_throwsSecurityException` | Caller has `Role.RUNNER`. | Throws `SecurityException` ("Only Race Admins or Super Admins can create races"). |
| `createRace_blankName_throwsIllegalArgumentException` | Request name is null or whitespace. | Throws `IllegalArgumentException` ("Race name is required"). |
| `createRace_invalidDistance_throwsIllegalArgumentException` | Distance is `"3K"` (not in `ALLOWED_DISTANCES`). | Throws `IllegalArgumentException` ("Invalid race distance..."). |
| `createRace_validDistances_formatsAndSaves` | Distance string is `"5K, 10KM, 21.1K"`. | Formats distances, trims whitespace, verifies all against `ALLOWED_DISTANCES`. |
| `createRace_nullRaceDate_throwsIllegalArgumentException` | Request `raceDate` is null. | Throws `IllegalArgumentException` ("Race date is required"). |
| `createRace_negativeFee_throwsIllegalArgumentException` | Fee is `-10.00`. | Throws `IllegalArgumentException` ("Valid registration fee is required"). |
| `createRace_omittedSubmissionDeadline_defaultsToPlusOneDay` | `submissionDeadline` is null. | Sets deadline to `raceDate.plusDays(1)`. |
| `createRace_customSubmissionDeadline_persistsDeadline` | `submissionDeadline` provided. | Preserves provided deadline. |
| `createRace_successful_savesWithDraftStatus` | Valid request from `RACE_ADMIN`. | Saves race with status `RaceStatus.DRAFT`, sets organizer to authenticated user. |
| `getAdminRaces_superAdmin_returnsAllOrdered` | Caller is `SUPER_ADMIN`. | Calls `raceRepository.findAllByOrderByCreatedAtDesc()`. |
| `getAdminRaces_raceAdmin_returnsOrganizerRaces` | Caller is `RACE_ADMIN`. | Calls `raceRepository.findByOrganizerIdOrderByCreatedAtDesc(userId)`. |
| `getAdminRaces_runnerRole_throwsSecurityException` | Caller is `RUNNER`. | Throws `SecurityException` ("Access denied..."). |
| `updateRace_notFound_throwsIllegalArgumentException` | Race ID not in repository. | Throws `IllegalArgumentException`. |
| `updateRace_unauthorizedUser_throwsSecurityException` | Non-super admin caller is not race organizer. | Throws `SecurityException` ("You do not have permission to modify this race"). |
| `updateRace_authorizedOrganizer_updatesPartialFields` | Owner updates name, fee, distance, description. | Applies partial updates and saves. |
| `updateRace_superAdmin_updatesAnyRace` | `SUPER_ADMIN` modifies another organizer's race. | Successfully updates and saves. |
| `updateRaceStatus_nullStatus_throwsIllegalArgumentException` | Request `status` is null. | Throws `IllegalArgumentException` ("Target status is required"). |
| `updateRaceStatus_publishByUnapprovedRaceAdmin_throwsIllegalStateException` | `RACE_ADMIN` with `status=PENDING_VETTING` publishes. | Throws `IllegalStateException` ("Your organizer account is pending KYC vetting..."). |
| `updateRaceStatus_publishByApprovedRaceAdmin_success` | `RACE_ADMIN` with `status=APPROVED` publishes. | Updates status to `RaceStatus.PUBLISHED`. |
| `updateRaceStatus_publishBySuperAdmin_success` | `SUPER_ADMIN` publishes. | Updates status to `RaceStatus.PUBLISHED` unconditionally. |

---

#### 1.3 `RaceResultServiceTest`
- **Class Under Test**: `com.kimbia.backend.service.RaceResultService` (146 lines)
- **Mocks**: `RaceResultRepository`, `RegistrationRepository`, `UserRepository`, `RaceRepository`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `submitResult_nullRegistrationId_throwsIllegalArgumentException` | Request `registrationId` is null. | Throws `IllegalArgumentException` ("Registration ID is required"). |
| `submitResult_registrationNotFound_throwsIllegalArgumentException` | Registration ID not found. | Throws `IllegalArgumentException` ("Registration not found for ID..."). |
| `submitResult_differentUserNonAdmin_throwsSecurityException` | Runner submits for another runner's registration without admin role. | Throws `SecurityException` ("You can only submit results for your own registration."). |
| `submitResult_adminSubmittingForUser_succeeds` | Caller has `ROLE_ADMIN` authority. | Allows submission for any registration. |
| `submitResult_paymentNotCompleted_throwsIllegalStateException` | Registration `paymentStatus` is `PENDING`. | Throws `IllegalStateException` ("Registration payment is not completed..."). |
| `submitResult_newResult_createsResultWithPendingStatus` | No existing result for registration. | Creates new `RaceResult` with status `ModerationStatus.PENDING`, finishing time, proof image, DNF flag. |
| `submitResult_existingResult_updatesFieldsAndSetsPending` | Result already exists for registration. | Reuses existing result record, updates fields, resets status to `PENDING`. |
| `getResultsForRaceAdmin_superAdmin_returnsResults` | Caller is `SUPER_ADMIN`. | Returns results for race ID. |
| `getResultsForRaceAdmin_raceAdminOwner_returnsResults` | Caller is `RACE_ADMIN` and organizes race. | Returns results. |
| `getResultsForRaceAdmin_raceAdminNotOwner_throwsSecurityException` | Caller is `RACE_ADMIN` but does not organize race. | Throws `SecurityException` ("Access denied: You can only view moderation results for races you organize"). |
| `getResultsForRaceAdmin_withStatusFilter_queriesFiltered` | Status filter provided (`PENDING`). | Calls `raceResultRepository.findByRaceIdAndModerationStatus(raceId, status)`. |
| `moderateResult_nullStatus_throwsIllegalArgumentException` | Moderation status in request is null. | Throws `IllegalArgumentException` ("Moderation status is required"). |
| `moderateResult_notFound_throwsIllegalArgumentException` | Result ID does not exist. | Throws `IllegalArgumentException`. |
| `moderateResult_unauthorizedAdmin_throwsSecurityException` | Non-super admin does not own the race. | Throws `SecurityException`. |
| `moderateResult_success_updatesStatusAndModeratedBy` | Authorized organizer approves result. | Sets `moderationStatus=APPROVED`, sets `moderatedBy=currentUser`, saves result. |
| `getLeaderboard_filtersDnfAndEmptyTimes_sortsAscendingByTime` | Approved results with mixed times ("00:45:00", "01:10:00", "00:35:00"), one DNF, one blank time. | Excludes DNF and blank time, returns sorted list: `["00:35:00", "00:45:00", "01:10:00"]`. |

---

#### 1.4 `AuthServiceTest`
- **Class Under Test**: `com.kimbia.backend.service.AuthService` (105 lines)
- **Mocks**: `UserRepository`, `PasswordEncoder`, `JwtService`, `AuthenticationManager`, `RefreshTokenService`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `register_emailAlreadyExists_throwsRuntimeException` | `userRepository.existsByEmail(email)` returns true. | Throws `RuntimeException` ("Email already exists"). |
| `register_superAdminRoleRequested_throwsIllegalArgumentException` | Request specifies `Role.SUPER_ADMIN`. | Throws `IllegalArgumentException` ("Registration of SUPER_ADMIN accounts is not permitted."). |
| `register_raceAdmin_setsPendingVettingAndLocalProvider` | Request specifies `Role.RACE_ADMIN`. | Sets `role=RACE_ADMIN`, `status=AccountStatus.PENDING_VETTING`, `authProvider=AuthProvider.LOCAL`. |
| `register_runner_setsActiveAndLocalProvider` | Request specifies `Role.RUNNER` or null. | Sets `role=RUNNER`, `status=AccountStatus.ACTIVE`. |
| `register_encodesPasswordAndGeneratesTokens` | Valid registration request. | Encodes password with `PasswordEncoder`, saves user, generates JWT & refresh token, returns `AuthResponse`. |
| `login_successful_authenticatesAndReturnsTokens` | Valid login request. | Calls `authenticationManager.authenticate`, fetches user, generates JWT & refresh token, returns `AuthResponse`. |
| `login_userNotFound_throwsIllegalArgumentException` | Auth manager succeeds but user missing in DB. | Throws `IllegalArgumentException` ("User not found with email..."). |
| `login_badCredentials_propagatesAuthenticationException` | `authenticationManager.authenticate` throws `BadCredentialsException`. | Propagates exception up. |
| `refreshAccessToken_nullOrEmptyToken_throwsIllegalArgumentException` | Request has null or blank refresh token. | Throws `IllegalArgumentException` ("Refresh token is required"). |
| `refreshAccessToken_tokenNotFound_throwsSecurityException` | Refresh token not found in database. | Throws `SecurityException` ("Invalid refresh token. Please sign in again."). |
| `refreshAccessToken_validToken_rotatesAndGeneratesNewAccessToken` | Valid unexpired refresh token. | Verifies expiration, rotates token (revokes old, issues new), generates new JWT access token, returns `AuthResponse`. |
| `logout_withToken_revokesToken` | Request provides refresh token string. | Calls `refreshTokenService.revokeToken(token)`. |
| `logout_nullToken_doesNothing` | Request has null token. | No-op, does not throw exception. |

---

#### 1.5 `RefreshTokenServiceTest`
- **Class Under Test**: `com.kimbia.backend.service.RefreshTokenService` (85 lines)
- **Mocks**: `RefreshTokenRepository`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `createRefreshToken_setsUserUuidExpirationAndNotRevoked` | User entity passed. | Generates UUID token, future expiry date (~30 days), sets `revoked=false`, saves to repository. |
| `findByToken_delegatesToRepository` | Token string. | Calls `refreshTokenRepository.findByToken(token)`. |
| `verifyExpiration_revokedToken_deletesAndThrowsSecurityException` | Token has `isRevoked() == true`. | Deletes token from repository and throws `SecurityException` ("Refresh token has been revoked..."). |
| `verifyExpiration_expiredToken_deletesAndThrowsSecurityException` | Token `expiryDate` is in the past. | Deletes token from repository and throws `SecurityException` ("Refresh token has expired..."). |
| `verifyExpiration_validToken_returnsToken` | Token unrevoked with future expiry date. | Returns token untouched. |
| `rotateRefreshToken_deletesOldAndIssuesNew` | Old valid refresh token. | Deletes old token and calls `createRefreshToken` for the associated user. |
| `revokeToken_exists_marksRevokedAndDeletes` | Token string exists in repository. | Sets `revoked=true`, deletes token, logs action. |
| `revokeToken_nullOrBlank_doesNothing` | Token string is null or whitespace. | No repository interaction. |
| `revokeAllUserTokens_delegatesToDeleteByUser` | User entity. | Calls `refreshTokenRepository.deleteByUser(user)`. |

---

#### 1.6 `RegistrationServiceTest`
- **Class Under Test**: `com.kimbia.backend.service.RegistrationService` (79 lines)
- **Mocks**: `RegistrationRepository`, `UserRepository`, `RaceRepository`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getRegistrationById_returnsOptional` | Registration ID. | Delegates to `registrationRepository.findById(id)`. |
| `getRegistrationsByRaceId_returnsList` | Race ID. | Delegates to `registrationRepository.findByRaceId(raceId)`. |
| `getRegistrationsForAdmin_raceNotFound_throwsIllegalArgumentException` | Race ID missing in database. | Throws `IllegalArgumentException` ("Race not found with id..."). |
| `getRegistrationsForAdmin_nonOrganizerRaceAdmin_throwsSecurityException` | Caller is `RACE_ADMIN` but not the race organizer. | Throws `SecurityException` ("Access denied: You can only view registrations for races you organize"). |
| `getRegistrationsForAdmin_organizer_returnsRegistrations` | Caller is organizer. | Returns registrations. |
| `getRegistrationsForAdmin_superAdmin_returnsRegistrations` | Caller is `SUPER_ADMIN`. | Returns registrations. |
| `getRegistrationsForAdmin_validPaymentStatus_filtersStatus` | Payment status string `"COMPLETED"`. | Parses `PaymentStatus.COMPLETED` and calls `registrationRepository.findByRaceIdAndPaymentStatus(...)`. |
| `getRegistrationsForAdmin_invalidPaymentStatus_throwsIllegalArgumentException` | Payment status string `"UNKNOWN_STATUS"`. | Throws `IllegalArgumentException` ("Invalid payment status..."). |
| `getRegistrationsByUserId_returnsList` | User ID. | Calls `registrationRepository.findByUserId(userId)`. |

---

#### 1.7 `AdminOrganizerServiceTest`
- **Class Under Test**: `com.kimbia.backend.service.AdminOrganizerService` (63 lines)
- **Mocks**: `UserRepository`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getOrganizers_nonSuperAdmin_throwsSecurityException` | Caller role is `RACE_ADMIN` or `RUNNER`. | Throws `SecurityException` ("Access denied: SUPER_ADMIN role required"). |
| `getOrganizers_superAdminWithoutStatus_returnsAllOrganizers` | `SUPER_ADMIN` calls with null status. | Calls `userRepository.findByRoleOrderByCreatedAtDesc(Role.RACE_ADMIN)`. |
| `getOrganizers_superAdminWithStatus_returnsFilteredOrganizers` | `SUPER_ADMIN` calls with `AccountStatus.PENDING_VETTING`. | Calls `userRepository.findByRoleAndStatusOrderByCreatedAtDesc(Role.RACE_ADMIN, status)`. |
| `approveOrganizer_nonSuperAdmin_throwsSecurityException` | Caller is not `SUPER_ADMIN`. | Throws `SecurityException`. |
| `approveOrganizer_organizerNotFound_throwsIllegalArgumentException` | Organizer ID not in repository. | Throws `IllegalArgumentException` ("Organizer not found with id..."). |
| `approveOrganizer_userNotRaceAdmin_throwsIllegalArgumentException` | Target user has role `RUNNER`. | Throws `IllegalArgumentException` ("User is not a race organizer..."). |
| `approveOrganizer_nullOrEmptyTinggServiceCode_throwsIllegalArgumentException` | Request has null or blank `tinggServiceCode`. | Throws `IllegalArgumentException` ("tingg_service_code is required for organizer approval"). |
| `approveOrganizer_validRequest_approvesAndSavesCode` | Valid request with service code `"TINGG123"`. | Sets `status=AccountStatus.APPROVED`, sets `tinggServiceCode="TINGG123"`, saves and returns user. |

---

#### 1.8 `TinggServiceTest`
- **Class Under Test**: `com.kimbia.backend.service.TinggService` (223 lines)
- **Testing Approach**: Mock `RestTemplate` injected via `ReflectionTestUtils`.

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getCheckoutUrl_successfulFormat1_returnsShortUrl` | Tingg API returns status 200 with `results.short_url`. | Successfully extracts and returns short URL string. |
| `getCheckoutUrl_successfulFormat2_returnsLongUrl` | Tingg API returns `{"status": {"status_code": 200}}` and `results.long_url`. | Extracts and returns long URL string. |
| `getCheckoutUrl_errorStatusCodeFormat1_throwsRuntimeException` | Tingg API returns status `1031` ("client not allowed"). | Throws `RuntimeException` ("Tingg Gateway Error (1031)..."). |
| `getCheckoutUrl_errorStatusCodeFormat2_throwsRuntimeException` | Tingg API returns `status_code=400` in nested status map. | Throws `RuntimeException` ("Tingg Gateway Error (400)..."). |
| `getCheckoutUrl_missingResults_throwsRuntimeException` | Body does not contain valid URL in results. | Throws `RuntimeException` ("Failed to get checkout URL from Tingg..."). |
| `getCheckoutUrl_httpStatusCodeException_throwsRuntimeException` | `restTemplate.exchange` throws `HttpClientErrorException`. | Catches HTTP error and wraps into informative `RuntimeException`. |
| `initiatePayout_successfulStatusCode139_returnsTinggPayoutResponse` | Tingg BEEP API returns status `139`. | Returns `TinggPayoutResponse` populated with `beep_transaction_id` and `status_code="139"`. |
| `initiatePayout_customServiceCode_usesCustomCode` | Custom service code passed. | Embeds custom service code inside packet payload. |
| `initiatePayout_fallbackToDefaultServiceCode_whenCustomNull` | Custom service code is null/blank. | Uses configured default `serviceCode`. |
| `initiatePayout_apiException_returnsPendingSandboxFallback` | `restTemplate.exchange` throws connection exception. | Returns fallback `TinggPayoutResponse` with `status_code="PENDING"` (sandbox graceful degradation). |

---

### Layer 2: Security & Authentication (`com.kimbia.backend.security`)

---

#### 2.1 `JwtServiceTest`
- **Class Under Test**: `com.kimbia.backend.security.JwtService` (77 lines)
- **Configuration**: Uses 256-bit test secret key and 900,000ms expiration via `ReflectionTestUtils`.

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `generateToken_withUserDetails_createsValidSignedToken` | Mock `UserDetails` with username `"runner@kimbia.africa"`. | Generates non-null, valid 3-part JWT string. |
| `generateToken_withExtraClaims_includesClaims` | Map containing `{"role": "RUNNER", "userId": 42}`. | Embeds claims into payload, verifiable via parser. |
| `extractUsername_validToken_extractsSubject` | Generated token. | Extracts username matching `"runner@kimbia.africa"`. |
| `extractClaim_customClaimResolver_extractsCorrectValue` | Token with expiration. | `extractClaim(token, Claims::getExpiration)` returns valid future `Date`. |
| `isTokenValid_matchingUserAndUnexpired_returnsTrue` | Token and matching `UserDetails`. | Returns `true`. |
| `isTokenValid_mismatchedUser_returnsFalse` | Token for `"userA@kimbia.africa"` tested against `"userB@kimbia.africa"`. | Returns `false`. |

---

#### 2.2 `JwtAuthenticationFilterTest`
- **Class Under Test**: `com.kimbia.backend.security.JwtAuthenticationFilter` (67 lines)
- **Mocks**: `JwtService`, `UserDetailsService`, `FilterChain`
- **Fixtures**: `MockHttpServletRequest`, `MockHttpServletResponse`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `doFilterInternal_noAuthorizationHeader_passesWithoutAuth` | Request without `Authorization` header. | Passes to `filterChain.doFilter`, `SecurityContextHolder` remains unauthenticated. |
| `doFilterInternal_nonBearerHeader_passesWithoutAuth` | Request with `Authorization: Basic xyz`. | Passes to `filterChain.doFilter`, no JWT extraction attempted. |
| `doFilterInternal_malformedJwt_passesWithoutAuth` | `Authorization: Bearer bad-token` where `extractUsername` throws exception. | Catches exception gracefully and calls `filterChain.doFilter`. |
| `doFilterInternal_validTokenAndNoExistingAuth_setsSecurityContextAuth` | Valid token, user found, no existing authentication in context. | Calls `userDetailsService.loadUserByUsername`, populates `SecurityContextHolder` with `UsernamePasswordAuthenticationToken`. |
| `doFilterInternal_existingAuthInContext_doesNotOverwrite` | Valid token, but `SecurityContextHolder` already has authentication. | Does not invoke `userDetailsService`, keeps existing auth. |
| `doFilterInternal_invalidToken_doesNotSetAuth` | `jwtService.isTokenValid` returns `false`. | Does not set authentication in `SecurityContextHolder`. |

---

#### 2.3 `ApplicationConfigTest`
- **Class Under Test**: `com.kimbia.backend.security.ApplicationConfig` (38 lines)
- **Mocks**: `UserRepository`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `userDetailsService_userExists_returnsUserDetails` | `userRepository.findByEmail` returns user. | `UserDetailsService.loadUserByUsername` returns the user. |
| `userDetailsService_userNotFound_throwsUsernameNotFoundException` | `userRepository.findByEmail` returns empty. | Throws `UsernameNotFoundException` ("User not found"). |
| `passwordEncoder_encodesAndMatchesBCrypt` | Instantiated `PasswordEncoder` bean. | Correctly encodes plaintext and `matches` returns true. |

---

### Layer 3: REST Controllers (`com.kimbia.backend.controller`)

Controllers handle HTTP request mapping, parameter validation, exception translation, and HTTP response statuses.

---

#### 3.1 `AuthControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.AuthController` (63 lines)
- **Mocks**: `AuthService`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `register_validRequest_returns200OkWithAuthResponse` | `authService.register` succeeds. | Returns `200 OK` with `AuthResponse`. |
| `login_validCredentials_returns200Ok` | `authService.login` succeeds. | Returns `200 OK` with `AuthResponse`. |
| `login_badCredentials_returns401Unauthorized` | `authService.login` throws `BadCredentialsException`. | Returns `401 Unauthorized` with `{"error": "Invalid email or password"}`. |
| `login_authenticationException_returns500` | `authService.login` throws `DisabledException`. | Returns `500 Internal Server Error`. |
| `login_genericException_returns500` | `authService.login` throws `RuntimeException`. | Returns `500 Internal Server Error`. |
| `refresh_validToken_returns200Ok` | `authService.refreshAccessToken` succeeds. | Returns `200 OK` with rotated tokens. |
| `refresh_securityException_returns401` | `authService.refreshAccessToken` throws `SecurityException`. | Returns `401 Unauthorized`. |
| `refresh_illegalArgumentException_returns400` | Missing refresh token throws `IllegalArgumentException`. | Returns `400 Bad Request`. |
| `refresh_genericException_returns500` | Unexpected error. | Returns `500 Internal Server Error`. |
| `logout_returns200Ok` | Any logout request. | Returns `200 OK` with `{"message": "Logged out successfully"}`. |

---

#### 3.2 `RaceControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.RaceController` (117 lines)
- **Mocks**: `RaceService`, `RaceResultService`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getPublishedRaces_returns200Ok` | Service returns races. | Returns `200 OK`. |
| `getRaceById_returns200Ok` | Service returns race. | Returns `200 OK`. |
| `getLeaderboard_returns200Ok` | Race ID and category. | Returns `200 OK` with leaderboard results. |
| `getResults_approvedDefault_returns200Ok` | `moderation_status` omitted or `APPROVED`. | Calls `raceResultService.getResultsForRace(raceId, APPROVED)` and returns `200 OK`. |
| `getResults_otherStatusSuccess_returns200Ok` | `moderation_status=PENDING` with auth. | Calls `raceResultService.getResultsForRaceAdmin(...)` and returns `200 OK`. |
| `getResults_otherStatusSecurityException_returns403Forbidden` | Unauthorized caller. | Returns `403 Forbidden` with error message. |
| `createRace_success_returns201Created` | Valid request. | Returns `201 Created` with created `Race`. |
| `createRace_illegalArgument_returns400BadRequest` | Service throws `IllegalArgumentException`. | Returns `400 Bad Request`. |
| `createRace_securityException_returns403Forbidden` | Service throws `SecurityException`. | Returns `403 Forbidden`. |
| `createRace_genericException_returns500InternalServerError` | Service throws unexpected exception. | Returns `500 Internal Server Error`. |
| `updateRace_success_returns200Ok` | Valid update request. | Returns `200 OK` with updated race. |
| `updateRace_illegalArgument_returns400BadRequest` | Invalid parameter. | Returns `400 Bad Request`. |
| `updateRace_securityException_returns403Forbidden` | Caller not owner. | Returns `403 Forbidden`. |
| `updateRaceStatus_success_returns200Ok` | Valid status change. | Returns `200 OK`. |
| `updateRaceStatus_illegalArgument_returns400BadRequest` | Status is null. | Returns `400 Bad Request`. |
| `updateRaceStatus_illegalStateKycPending_returns403Forbidden` | KYC vetting required. | Returns `403 Forbidden`. |
| `updateRaceStatus_securityException_returns403Forbidden` | Unauthorized. | Returns `403 Forbidden`. |

---

#### 3.3 `PaymentControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.PaymentController` (54 lines)
- **Mocks**: `PaymentService`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `checkout_success_returns200OkWithCheckoutResponse` | Valid checkout request. | Returns `200 OK` with `CheckoutResponse`. |
| `checkout_httpStatusCodeException_returns500WithTinggDetails` | Service throws `HttpClientErrorException`. | Returns `500` with status code and response body payload. |
| `checkout_genericException_returns500` | Service throws `RuntimeException`. | Returns `500 Internal Server Error`. |
| `simulate_success_returns200Ok` | `simulateSuccess` completes. | Returns `200 OK` with `{"status": "simulated"}`. |
| `simulate_failure_returns500` | `simulateSuccess` throws. | Returns `500 Internal Server Error`. |

---

#### 3.4 `WebhookControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.WebhookController` (44 lines)
- **Mocks**: `PaymentService`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `handleTinggWebhook_returns200OkWithAck` | `TinggWebhookPayload`. | Returns `200 OK` with `TinggWebhookAckResponse`. |
| `handleTinggPayoutCallback_success_returns200Ok` | Valid callback payload. | Returns `200 OK` with acknowledgment map. |
| `handleTinggPayoutCallback_illegalArgument_returns400BadRequest` | Missing transaction ID. | Returns `400 Bad Request`. |
| `handleTinggPayoutCallback_genericException_returns500` | Unexpected error. | Returns `500 Internal Server Error`. |

---

#### 3.5 `RegistrationControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.RegistrationController` (36 lines)
- **Mocks**: `RegistrationService`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getStatus_found_returns200OkWithStatusAndBib` | Registration found. | Returns `200 OK` with `RegistrationStatusResponse` (status, paymentStatus, bibNumber). |
| `getStatus_notFound_throwsRuntimeException` | Registration missing. | Throws `RuntimeException` ("Not found"). |
| `getMyRegistrations_returns200Ok` | User principal injected. | Returns `200 OK` with user's registrations. |

---

#### 3.6 `ResultControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.ResultController` (41 lines)
- **Mocks**: `RaceResultService`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `submitResult_success_returns201Created` | Valid submission. | Returns `201 Created` with `RaceResult`. |
| `submitResult_illegalArgument_returns400BadRequest` | Invalid registration ID. | Returns `400 Bad Request`. |
| `submitResult_illegalState_returns409Conflict` | Payment not completed. | Returns `409 Conflict`. |
| `submitResult_securityException_returns403Forbidden` | Submitting for someone else. | Returns `403 Forbidden`. |
| `submitResult_genericException_returns500` | Unexpected exception. | Returns `500 Internal Server Error`. |

---

#### 3.7 `AdminAwardControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.AdminAwardController` (87 lines)
- **Mocks**: `PaymentService`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `initiatePayout_success_returns200Ok` | Valid request. | Returns `200 OK` with payout response map. |
| `initiatePayout_illegalArgument_returns400BadRequest` | Invalid parameter. | Returns `400 Bad Request`. |
| `initiatePayout_illegalState_returns409Conflict` | Result not approved. | Returns `409 Conflict`. |
| `initiatePayout_genericException_returns500` | Unexpected error. | Returns `500 Internal Server Error`. |
| `simulatePayoutSuccess_success_returns200Ok` | Valid payment ID. | Returns `200 OK` with simulated status. |
| `simulatePayoutSuccess_failure_returns500` | Simulation error. | Returns `500 Internal Server Error`. |
| `getAwardPayments_success_returns200Ok` | Valid query. | Returns `200 OK` with payment list. |
| `getAwardPayments_withFallbackParams_resolvesCorrectly` | Request uses camelCase `raceIdFallback` and `awardTypeFallback`. | Resolves parameters and parses `AwardType`. |
| `getAwardPayments_securityException_returns403Forbidden` | Unauthorized caller. | Returns `403 Forbidden`. |

---

#### 3.8 `AdminOrganizerControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.AdminOrganizerController` (64 lines)
- **Mocks**: `AdminOrganizerService`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getOrganizers_success_returns200Ok` | Valid super admin request. | Returns `200 OK` with organizer list. |
| `getOrganizers_securityException_returns403Forbidden` | Non-super admin. | Returns `403 Forbidden`. |
| `getOrganizers_illegalArgument_returns400BadRequest` | Invalid filter. | Returns `400 Bad Request`. |
| `approveOrganizer_success_returns200Ok` | Valid approval request. | Returns `200 OK` with approved `User`. |
| `approveOrganizer_securityException_returns403Forbidden` | Non-super admin. | Returns `403 Forbidden`. |
| `approveOrganizer_illegalArgument_returns400BadRequest` | Missing service code. | Returns `400 Bad Request`. |

---

#### 3.9 `AdminResultControllerTest`
- **Class Under Test**: `com.kimbia.backend.controller.AdminResultController` (67 lines)
- **Mocks**: `RaceResultService`, `Authentication`

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getResultsForRace_success_returns200Ok` | Authorized caller. | Returns `200 OK` with race results. |
| `getResultsForRace_securityException_returns403Forbidden` | Unauthorized caller. | Returns `403 Forbidden`. |
| `moderateResult_success_returns200Ok` | Authorized organizer moderates. | Returns `200 OK` with updated result. |
| `moderateResult_securityException_returns403Forbidden` | Unauthorized caller. | Returns `403 Forbidden`. |
| `moderateResult_illegalArgument_returns400BadRequest` | Missing status. | Returns `400 Bad Request`. |

---

### Layer 4: Domain Entities & Enums (`entity` & `enums`)

---

#### 4.1 `AwardTypeTest`
- **Class Under Test**: `com.kimbia.backend.enums.AwardType` (23 lines)

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `fromString_money_returnsMoney` | Value `"MONEY"`. | Returns `AwardType.MONEY`. |
| `fromString_mobileMoney_returnsMoney` | Value `"MOBILE_MONEY"`. | Returns `AwardType.MONEY`. |
| `fromString_airtime_returnsAirtime` | Value `"AIRTIME"`. | Returns `AwardType.AIRTIME`. |
| `fromString_caseInsensitive_returnsEnum` | Values `"money"`, `"AirTime"`. | Returns respective enum constants. |
| `fromString_null_returnsNull` | Null input. | Returns `null`. |
| `fromString_invalid_throwsIllegalArgumentException` | Value `"CRYPTO"`. | Throws `IllegalArgumentException` ("Unknown AwardType: CRYPTO"). |

---

#### 4.2 `UserTest`
- **Class Under Test**: `com.kimbia.backend.entity.User` (151 lines)

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `getAuthorities_returnsRolePrefixedWithRole` | User with `Role.RACE_ADMIN`. | Returns single authority `"ROLE_RACE_ADMIN"`. |
| `getUsername_returnsEmail` | User with `email="runner@kimbia.africa"`. | Returns `"runner@kimbia.africa"`. |
| `getPassword_returnsPasswordHash` | User with `passwordHash="hashed123"`. | Returns `"hashed123"`. |
| `userDetailsBooleans_allReturnTrue` | `isAccountNonExpired`, `isAccountNonLocked`, `isCredentialsNonExpired`, `isEnabled`. | All return `true`. |
| `computedProperties_returnCorrectValues` | User with name, phone, tinggServiceCode, avatarUrl. | `getOrganization()` returns name; `getPhone()` returns mobileNumber; `getTinggAccountId()` returns tinggServiceCode; `getAvatarUrlCamel()` returns avatarUrl. |

---

#### 4.3 `RaceResultTest`
- **Class Under Test**: `com.kimbia.backend.entity.RaceResult` (104 lines)

| Test Method | Scenario / Given | Expected Behavior / Assertions |
| :--- | :--- | :--- |
| `computedGetters_withPopulatedGraph_returnCorrectValues` | Result linked to `Registration` -> `User`, `Race`. | Tests `getRegistrationId()`, `getRunnerName()`, `getRunnerEmail()`, `getRaceId()`, `getBibNumber()`, `getUserId()`, `getRunnerPhone()`, `getCategory()`, `getGender()`. |
| `computedGetters_nullSafetyCheck_allReturnNull` | `registration` is null. | All computed getters return `null` without throwing `NullPointerException`. |

## Coverage Impact & Verification Matrix

### Total Tests
| Component | Total Tests | Target Line Coverage |
| :--- | :---: | :---: |
| **Services** | 115 | **~85%** |
| **Controllers** | 78 | **~85%** |
| **Security** | 15 | **~90%** |
| **Entities / Enums** | 18 | **~75%** |
| **Total** | **226** | **~65% - 70%** |

### Execution Commands
```powershell
# 1. Run all unit tests cleanly in isolation
cd c:\Users\HomePC\Kimbia\backend
.\mvnw.cmd clean test

# 2. Generate HTML JaCoCo code coverage report
.\mvnw.cmd jacoco:report

# 3. View code coverage results in browser
Start-Process "target\site\jacoco\index.html"

# 4. Verify quality gate (fails build if < 50.0%)
.\mvnw.cmd verify
```

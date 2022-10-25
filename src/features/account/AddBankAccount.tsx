import { useQuery } from '@tanstack/react-query';
import groupBy from 'lodash/groupBy';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Box, Button, Container, Heading, Select } from 'theme-ui';
import { useSignedInUser } from '../auth/AuthContext';
import { Spinner } from '../ui/Spinner/Spinner';
import { Institution } from './institutions/institution.types';
import { getInstitutions, postRequisition } from './institutions/services/institutions.nordigen';
import { addUserRequisition } from './institutions/services/requisitions.firebase';

const countries: Array<{ value: string; label: string }> = [
  { value: 'nl', label: 'Dutch' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'Germany' },
  { value: 'it', label: 'Italy' },
  { value: 'gb', label: 'United Kingdom' },
];

export function AddBankAccount() {
  const user = useSignedInUser();
  const [country, setCountry] = useState<string | undefined>(undefined);
  const { data: institutions, fetchStatus } = useQuery(
    ['countryBanks', country],
    () => getInstitutions(country!),
    {
      enabled: !!country,
    },
  );

  const institutionsByFirstLetter = useMemo(() => {
    return institutions
      ? groupBy(institutions, (institution) => institution.name[0].toUpperCase())
      : [];
  }, [institutions]);

  const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setCountry(event.target.value);
  }, []);

  const handleInstitutionSelect = useCallback(
    async (institution: Institution) => {
      const requisition = await postRequisition(user.uid, institution.id);
      await addUserRequisition(user.uid, requisition);

      window.location.assign(requisition.link);
    },
    [user],
  );

  return (
    <Container>
      <Select defaultValue="default" value={country} onChange={handleChange} sx={{ width: '100%' }}>
        <option disabled value="default">
          Select a country
        </option>
        {countries.map((item) => (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        ))}
      </Select>

      <Box>
        {fetchStatus === 'fetching' ? (
          <Spinner />
        ) : (
          <Box>
            {Object.entries(institutionsByFirstLetter).map(([letter, institutions]) => {
              return (
                <Box key={letter}>
                  <Heading as="h3" sx={{ my: [4] }}>
                    {letter}
                  </Heading>
                  {institutions.map((institution) => (
                    <Box key={institution.id} sx={{ mb: [1] }}>
                      <Button
                        type="button"
                        variant="link"
                        sx={{ textAlign: 'left' }}
                        onClick={() => handleInstitutionSelect(institution)}
                      >
                        {institution.name}
                      </Button>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Container>
  );
}
